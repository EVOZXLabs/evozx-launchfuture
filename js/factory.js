import { BrowserProvider, Contract, JsonRpcProvider, Interface } from "https://esm.sh/ethers@6";
import { CONTRACTS, NETWORK } from "./config.js";
import { getSigner } from "./wallet.js";

let factoryAbi, evozxAbi, factoryInterface, readProvider;
let factoryRead, factoryWrite, evozxRead, evozxWrite;

async function loadAbi(path) {
  const res = await fetch(path);
  if (!res.ok) throw new Error(`Unable to load ABI: ${path}`);
  return await res.json();
}

export async function loadFactoryAbi() {
  if (factoryAbi) return factoryAbi;
  factoryAbi = await loadAbi("./abi/factory.json");
  factoryInterface = new Interface(factoryAbi);
  return factoryAbi;
}

export async function loadEVOZXAbi() {
  if (evozxAbi) return evozxAbi;
  evozxAbi = await loadAbi("./abi/evozx.json");
  return evozxAbi;
}

export function getReadProvider() {
  if (readProvider) return readProvider;
  return (readProvider = new JsonRpcProvider(NETWORK.rpc));
}

export async function getFactoryRead() {
  if (factoryRead) return factoryRead;
  const abi = await loadFactoryAbi();
  return (factoryRead = new Contract(CONTRACTS.factory, abi, getReadProvider()));
}

export async function getEVOZXRead() {
  if (evozxRead) return evozxRead;
  const abi = await loadEVOZXAbi();
  return (evozxRead = new Contract(CONTRACTS.evozx, abi, getReadProvider()));
}

export async function getFactoryWrite() {
  const signer = getSigner();
  if (!signer) throw new Error("Wallet not connected.");
  const abi = await loadFactoryAbi();
  return (factoryWrite = new Contract(CONTRACTS.factory, abi, signer));
}

export const getFactoryForWrite = getFactoryWrite;

export async function getEVOZXWrite() {
  const signer = getSigner();
  if (!signer) throw new Error("Wallet not connected.");
  const abi = await loadEVOZXAbi();
  return (evozxWrite = new Contract(CONTRACTS.evozx, abi, signer));
}

function parseTokenCreated(receipt) {
  if (!receipt) return null;

  for (const log of receipt.logs) {
    try {
      const p = factoryInterface.parseLog(log);
      if (p?.name === "TokenCreated") {
        return {
          token: p.args.token,
          creator: p.args.creator,
          name: p.args.name,
          symbol: p.args.symbol,
          supply: p.args.supply,
          chainId: p.args.chainId
        };
      }
    } catch {}
  }
  return null;
}

// ================= FACTORY INFO =================
export async function getFactoryName() {
  return (await getFactoryRead()).FACTORY_NAME();
}

export async function getVersion() {
  return (await getFactoryRead()).VERSION();
}

export async function getTreasury() {
  return (await getFactoryRead()).treasury();
}

// ================= TOKEN DATA =================
export async function getTotalTokens() {
  return Number(await (await getFactoryRead()).totalTokens());
}

export async function getAllTokens() {
  return (await getFactoryRead()).getAllTokens();
}

// ================= SYMBOL =================
export async function symbolExists(symbol) {
  if (!symbol) return false;
  return (await getFactoryRead()).symbolExists(symbol.trim());
}

// ================= FEE =================
export async function getDeploymentFee(config) {
  return (await getFactoryRead()).getDeploymentFee(config);
}

// ================= EVOZX =================
export async function getEVOZXBalance(address) {
  if (!address) throw new Error("Wallet address is required.");
  return (await getEVOZXRead()).balanceOf(address);
}

export async function getEVOZXAllowance(address) {
  if (!address) return 0n;
  return (await getEVOZXRead()).allowance(address, CONTRACTS.factory);
}

// ================= FACTORY CONST =================
export async function getFeeMultiplier() {
  return (await getFactoryRead()).feeMultiplier();
}

export async function getLaunchKitVersion() {
  return (await getFactoryRead()).LAUNCHKIT_VERSION();
}

export async function getOwner() {
  return (await getFactoryRead()).owner();
}

// ================= TOKEN LOOKUP =================
export async function getToken(i) {
  return (await getFactoryRead()).getToken(i);
}

export async function getTokensByCreator(addr) {
  if (!addr) return [];
  return (await getFactoryRead()).getTokensByCreator(addr);
}

export async function isFactoryToken(addr) {
  if (!addr) return false;
  return (await getFactoryRead()).isTokenFromFactory(addr);
}

// ================= APPROVE EVOZX =================
export async function approveEVOZX(amount) {
  if (!amount || amount <= 0n) throw new Error("Invalid approval amount.");
  const token = await getEVOZXWrite();
  const tx = await token.approve(CONTRACTS.factory, amount);
  await tx.wait();
  return tx;
}

// ================= CREATE TOKEN =================
export async function createToken(config) {
  const factory = await getFactoryWrite();
  const tx = await factory.createToken(config);
  const receipt = await tx.wait();

  const e = parseTokenCreated(receipt);
  if (!e) throw new Error("TokenCreated event not found.");

  return {
    hash: receipt.hash,
    blockNumber: receipt.blockNumber,
    token: e.token,
    creator: e.creator,
    name: e.name,
    symbol: e.symbol,
    supply: e.supply,
    chainId: e.chainId
  };
}

// ================= HELPERS =================
export async function ensureApproval(owner, amt) {
  const a = await getEVOZXAllowance(owner);
  if (a >= amt) return false;
  await approveEVOZX(amt);
  return true;
}

export async function hasEnoughEVOZX(owner, amt) {
  return (await getEVOZXBalance(owner)) >= amt;
}

export async function getDeploymentPreview(config, owner) {
  const fee = await getDeploymentFee(config);
  const balance = await getEVOZXBalance(owner);
  const allowance = await getEVOZXAllowance(owner);

  return {
    fee,
    balance,
    allowance,
    enoughBalance: balance >= fee,
    approved: allowance >= fee
  };
}

// ================= FORMAT =================
export const toBigInt = (v) => BigInt(v);

export const isZeroAddress = (a) =>
  !a || a === "0x0000000000000000000000000000000000000000";
