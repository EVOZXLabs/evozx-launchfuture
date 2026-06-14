import { BrowserProvider, Contract } from "https://esm.sh/ethers@6";
import { CONTRACTS } from "./config.js";
import { getSigner } from "./wallet.js";

// ======================================================
// ABI CACHE & LOADER
// ======================================================
const cache = { factory: null, evozx: null };

async function loadAbi(name) {
    if (cache[name]) return cache[name];
    const res = await fetch(`./abi/${name}.json`);
    return (cache[name] = await res.json());
}

// ======================================================
// CONTRACT HELPERS
// ======================================================
const getProvider = () => {
    if (!window.ethereum) throw new Error("Wallet not detected");
    return new BrowserProvider(window.ethereum);
};

async function getContract(address, abiName, write = false) {
    const abi = await loadAbi(abiName);
    if (write) {
        const signer = getSigner();
        if (!signer) throw new Error("Wallet not connected");
        return new Contract(address, abi, signer);
    }
    return new Contract(address, abi, getProvider());
}

// ======================================================
// EXPORTS: FACTORY
// ======================================================
export const getFactoryRead = () => getContract(CONTRACTS.FACTORY, "factory");
export const getFactoryWrite = () => getContract(CONTRACTS.FACTORY, "factory", true);
export const getFactoryForWrite = getFactoryWrite; // Alias

export const getFactoryName = async () => (await getFactoryRead()).FACTORY_NAME();
export const getVersion = async () => Number(await (await getFactoryRead()).LAUNCHKIT_VERSION());
export const getTreasury = async () => (await getFactoryRead()).treasury();
export const getTotalTokens = async () => Number(await (await getFactoryRead()).totalTokens());
export const getAllTokens = async () => (await getFactoryRead()).getAllTokens();

export async function symbolExists(symbol) {
    try { return await (await getFactoryRead()).symbolExists(symbol); }
    catch (e) { console.error(e); return false; }
}

export async function getDeploymentFee(config) {
    try { return await (await getFactoryRead()).getDeploymentFee(config); }
    catch (e) { console.error(e); return 0n; }
}

export async function createToken(config) {
    return await (await getFactoryWrite()).createToken(config);
}

// ======================================================
// EXPORTS: EVOZX
// ======================================================
export const getEVOZXRead = () => getContract(CONTRACTS.EVOZX, "evozx");
export const getEVOZXWrite = () => getContract(CONTRACTS.EVOZX, "evozx", true);

export async function getEVOZXBalance(wallet) {
    try { return await (await getEVOZXRead()).balanceOf(wallet); }
    catch (e) { console.error(e); return 0n; }
}

export async function getEVOZXAllowance(owner) {
    try { return await (await getEVOZXRead()).allowance(owner, CONTRACTS.FACTORY); }
    catch (e) { console.error(e); return 0n; }
}

export async function approveEVOZX(amount) {
    return await (await getEVOZXWrite()).approve(CONTRACTS.FACTORY, amount);
}
