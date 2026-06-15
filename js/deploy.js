import { ethers } from "https://cdn.jsdelivr.net/npm/ethers@6.15.0/+esm";
import { getAccount } from "./wallet.js";
import { getDeploymentFee, getEVOZXBalance, getEVOZXAllowance, approveEVOZX, createToken } from "./factory.js";
import { autoTopupEVOZX } from "./exchange.js";

const DECIMALS = 18;

// ========================= BALANCE =========================
export async function balanceOf() {
  return await getEVOZXBalance();
}

export async function allowance() {
  return await getEVOZXAllowance();
}

// ========================= APPROVE =========================
export async function approve(amount) {
  if (amount <= 0n) throw new Error("Invalid approval amount.");
  return await approveEVOZX(amount);
}

// ========================= FORMAT BALANCE =========================
export async function getBalance() {
  const raw = await balanceOf();
  return Number(ethers.formatUnits(raw, DECIMALS));
}

// ========================= APPROVE FACTORY (simple) =========================
export async function approveFactory(fee) {
  const currentAllowance = await allowance();
  if (currentAllowance >= fee) return;
  await approve(fee);
}

// ========================= VALIDATION =========================
export function validateInput(f) {
  if (!f) throw new Error("Invalid form.");

  f.name = f.name.trim();
  if (f.name.length < 2) throw new Error("Token name must contain at least 2 characters.");

  f.symbol = f.symbol.trim().toUpperCase();
  if (f.symbol.length < 2) throw new Error("Token symbol must contain at least 2 characters.");
  if (f.symbol.length > 12) throw new Error("Maximum symbol length is 12 characters.");

  f.supply = Number(f.supply);
  if (Number.isNaN(f.supply)) throw new Error("Invalid supply.");
  if (f.supply <= 0) throw new Error("Supply must be greater than zero.");
  if (f.supply > 1_000_000_000_000) throw new Error("Maximum supply is 1 trillion.");

  f.buyTax = Number(f.buyTax);
  if (f.buyTaxEnabled && (f.buyTax < 0 || f.buyTax > 10)) throw new Error("Buy tax must be between 0 and 10%.");

  f.sellTax = Number(f.sellTax);
  if (f.sellTaxEnabled && (f.sellTax < 0 || f.sellTax > 10)) throw new Error("Sell tax must be between 0 and 10%.");

  f.burnTaxShare = Number(f.burnTaxShare);
  if (f.burnTaxShare < 0 || f.burnTaxShare > 100) throw new Error("Burn share must be between 0 and 100%.");

  if ((f.buyTaxEnabled || f.sellTaxEnabled)) {
    const hasBurn = f.burnTaxShare > 0;
    const hasMarketing = f.marketingWallet && ethers.isAddress(f.marketingWallet);
    const hasDev = f.developmentWallet && ethers.isAddress(f.developmentWallet);

    if (!hasBurn && !hasMarketing && !hasDev)
      throw new Error("Tax requires burn share or at least one wallet.");
  }

  if (f.marketingWallet && !ethers.isAddress(f.marketingWallet)) throw new Error("Invalid marketing wallet.");
  if (f.developmentWallet && !ethers.isAddress(f.developmentWallet)) throw new Error("Invalid development wallet.");

  f.maxWalletPercent = Number(f.maxWalletPercent);
  if (f.maxWalletEnabled && (f.maxWalletPercent <= 0 || f.maxWalletPercent > 100))
    throw new Error("Max wallet must be between 1 and 100%.");

  f.maxTxPercent = Number(f.maxTxPercent);
  if (f.maxTxEnabled && (f.maxTxPercent <= 0 || f.maxTxPercent > 100))
    throw new Error("Max transaction must be between 1 and 100%.");

  if (f.website.length > 300) throw new Error("Website URL is too long.");
  if (f.telegram.length > 300) throw new Error("Telegram URL is too long.");
  if (f.twitter.length > 300) throw new Error("Twitter URL is too long.");
  if (f.logoURI.length > 500) throw new Error("Logo URL is too long.");

  return f;
}

// ========================= BUILD CONFIG =========================
export function buildConfig(f) {
  return {
    name: f.name.trim(),
    symbol: f.symbol.trim().toUpperCase(),
    supply: BigInt(f.supply),
    owner: ethers.ZeroAddress,

    chainId: 0,
    launchKitVersion: 0,

    burnable: !!f.burnable,
    mintable: !!f.mintable,
    ownershipEnabled: !!f.ownershipEnabled,

    website: f.website?.trim() ?? "",
    telegram: f.telegram?.trim() ?? "",
    twitter: f.twitter?.trim() ?? "",
    logoURI: f.logoURI?.trim() ?? "",

    maxWalletEnabled: !!f.maxWalletEnabled,
    maxWalletPercent: Number(f.maxWalletEnabled ? f.maxWalletPercent : 0),

    maxTxEnabled: !!f.maxTxEnabled,
    maxTxPercent: Number(f.maxTxEnabled ? f.maxTxPercent : 0),

    tradingControlEnabled: !!f.tradingControlEnabled,
    tradingEnabled: !!f.tradingEnabled,

    buyTaxEnabled: !!f.buyTaxEnabled,
    buyTax: Number(f.buyTaxEnabled ? f.buyTax : 0),

    sellTaxEnabled: !!f.sellTaxEnabled,
    sellTax: Number(f.sellTaxEnabled ? f.sellTax : 0),

    burnTaxShare: Number((f.buyTaxEnabled || f.sellTaxEnabled) ? f.burnTaxShare : 0),

    marketingWallet: f.marketingWallet || ethers.ZeroAddress,
    developmentWallet: f.developmentWallet || ethers.ZeroAddress
  };
}

// ========================= APPROVE FACTORY =========================
export async function approveFactory(config) {
  const fee = await getDeploymentFee(config);
  const current = await getEVOZXAllowance();

  if (current >= fee) return fee;

  const tx = await approveEVOZX(fee);
  await tx.wait();

  const newAllowance = await getEVOZXAllowance();
  if (newAllowance < fee) throw new Error("Factory approval failed.");

  return fee;
}

// ========================= DEPLOY TOKEN =========================
export async function deployToken(formData) {
  const account = getAccount();
  if (!account) throw new Error("Wallet not connected.");

  validateInput(formData);

  const config = buildConfig(formData);

  const exists = await symbolExists(config.symbol);
  if (exists) throw new Error("Symbol already exists.");

  const fee = await getDeploymentFee(config);
  const balance = await getEVOZXBalance(account);

  if (balance < fee) await autoTopupEVOZX(fee);

  await approveFactory(config);

  const result = await createToken(config);

  const key = "launchfuture:history";

  localStorage.setItem("launchfuture:lastDeployment", JSON.stringify({
    hash: result.hash,
    token: result.token,
    creator: result.creator,
    name: result.name,
    symbol: result.symbol,
    supply: result.supply.toString(),
    chainId: result.chainId.toString(),
    deployedAt: Date.now()
  }));

  const history = JSON.parse(localStorage.getItem(key) ?? "[]");
  history.unshift({
    hash: result.hash,
    token: result.token,
    creator: result.creator,
    name: result.name,
    symbol: result.symbol,
    supply: result.supply.toString(),
    chainId: result.chainId.toString(),
    deployedAt: Date.now()
  });

  localStorage.setItem(key, JSON.stringify(history));

  window.location.href = `success.html?token=${result.token}`;
}
