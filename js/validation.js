import { isAddress } from "https://esm.sh/ethers@6";
import { symbolExists } from "./factory.js";

export const LIMITS = {
  MIN_NAME_LENGTH: 2,
  MIN_SYMBOL_LENGTH: 2,
  MAX_SYMBOL_LENGTH: 12,
  MAX_SUPPLY: 1_000_000_000_000,
  MIN_SUPPLY: 1,
  MAX_TAX: 10,
  MIN_PERCENT: 1,
  MAX_PERCENT: 100
};

const text = (v) => String(v ?? "").trim();
export const required = (v) => text(v).length > 0;

// ================= NAME =================
export function validateName(n) {
  n = text(n);
  if (!n) return "Token name is required.";
  if (n.length < LIMITS.MIN_NAME_LENGTH) return "Token name must contain at least 2 characters.";
  return "";
}

// ================= SYMBOL =================
export function validateSymbol(s) {
  s = text(s);
  if (!s) return "Token symbol is required.";
  if (s.length < LIMITS.MIN_SYMBOL_LENGTH) return "Token symbol must contain at least 2 characters.";
  if (s.length > LIMITS.MAX_SYMBOL_LENGTH) return "Maximum symbol length is 12.";
  return "";
}

export async function checkSymbol(s) {
  const err = validateSymbol(s);
  if (err) return { valid: false, exists: false, message: err };

  const exists = await symbolExists(text(s));
  return {
    valid: !exists,
    exists,
    message: exists ? "Symbol already exists." : ""
  };
}

// ================= SUPPLY =================
export function validateSupply(v) {
  const n = Number(v);
  if (!Number.isFinite(n)) return "Invalid supply.";
  if (n < LIMITS.MIN_SUPPLY) return "Supply must be greater than 0.";
  if (n > LIMITS.MAX_SUPPLY) return "Maximum supply is 1 Trillion.";
  return "";
}

// ================= TAX =================
export function validateTax(v) {
  v = Number(v);
  if (Number.isNaN(v)) return "Invalid tax.";
  if (v < 0 || v > LIMITS.MAX_TAX) return "Tax must be between 0% and 10%.";
  return "";
}

// ================= PERCENT =================
export function validatePercent(v) {
  v = Number(v);
  if (Number.isNaN(v)) return "Invalid percentage.";
  if (v < LIMITS.MIN_PERCENT || v > LIMITS.MAX_PERCENT)
    return "Percentage must be between 1 and 100.";
  return "";
}

// ================= URL =================
export function validateURL(url) {
  url = text(url);
  if (!url) return "";
  try { new URL(url); return ""; }
  catch { return "Invalid URL."; }
}

// ================= ADDRESS =================
export function validateAddress(a) {
  a = text(a);
  if (!a) return "";
  return isAddress(a) ? "" : "Invalid wallet address.";
}

// ================= TAX RECEIVERS =================
export function validateTaxReceivers(c) {
  if (!c.buyTaxEnabled && !c.sellTaxEnabled) return "";

  const burn = Number(c.burnTaxShare);
  const marketing = text(c.marketingWallet);
  const dev = text(c.developmentWallet);

  if (burn > 0 || marketing || dev) return "";

  return "Buy Tax or Sell Tax requires Burn Share or Marketing Wallet or Development Wallet.";
}

// ================= CONFIG VALIDATION =================
export function validateConfig(c) {
  let e;

  if ((e = validateName(c.name))) return e;
  if ((e = validateSymbol(c.symbol))) return e;
  if ((e = validateSupply(c.supply))) return e;

  if (c.buyTaxEnabled && (e = validateTax(c.buyTax))) return e;
  if (c.sellTaxEnabled && (e = validateTax(c.sellTax))) return e;

  if (c.maxWalletEnabled && (e = validatePercent(c.maxWalletPercent))) return e;
  if (c.maxTxEnabled && (e = validatePercent(c.maxTxPercent))) return e;

  if ((e = validateURL(c.website))) return e;
  if ((e = validateURL(c.telegram))) return e;
  if ((e = validateURL(c.twitter))) return e;
  if ((e = validateURL(c.logoURI))) return e;

  if ((e = validateAddress(c.marketingWallet))) return e;
  if ((e = validateAddress(c.developmentWallet))) return e;

  if ((e = validateTaxReceivers(c))) return e;

  return "";
}
