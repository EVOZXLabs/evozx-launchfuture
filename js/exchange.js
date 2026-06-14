import {
  BrowserProvider,
  Contract,
  parseEther,
  formatEther
} from "https://esm.sh/ethers@6";

import {
  CONTRACTS
} from "./config.js";

import {
  getSigner
} from "./wallet.js";

let EXCHANGE_ABI = null;

// =====================================
// ABI LOADER
// =====================================

async function loadExchangeAbi() {

  if (EXCHANGE_ABI) {
    return EXCHANGE_ABI;
  }

  try {

    const response =
      await fetch(
        "./abi/exchange.json"
      );

    EXCHANGE_ABI =
      await response.json();

    return EXCHANGE_ABI;

  } catch (error) {

    console.error(
      "Exchange ABI error:",
      error
    );

    return null;
  }
}

// =====================================
// READ CONTRACT
// =====================================

async function getExchangeRead() {

  if (!window.ethereum) {
    throw new Error(
      "Wallet not found"
    );
  }

  const provider =
    new BrowserProvider(
      window.ethereum
    );

  const abi =
    await loadExchangeAbi();

  return new Contract(
    CONTRACTS.EXCHANGE,
    abi,
    provider
  );
}

// =====================================
// WRITE CONTRACT
// =====================================

async function getExchangeWrite() {

  const signer =
    getSigner();

  if (!signer) {
    throw new Error(
      "Wallet not connected"
    );
  }

  const abi =
    await loadExchangeAbi();

  return new Contract(
    CONTRACTS.EXCHANGE,
    abi,
    signer
  );
}

// =====================================
// RATE
// =====================================

export async function getRate() {

  try {

    const exchange =
      await getExchangeRead();

    const rate =
      await exchange.rate();

    return Number(rate);

  } catch (error) {

    console.error(
      "Rate error:",
      error
    );

    return 5;
  }
}

// =====================================
// STOCK
// =====================================

export async function getStock() {

  try {

    const exchange =
      await getExchangeRead();

    const stock =
      await exchange.getAvailableStock();

    return Number(
      formatEther(stock)
    );

  } catch (error) {

    console.error(
      "Stock error:",
      error
    );

    return 0;
  }
}

// =====================================
// REQUIRED EVOZ
// =====================================

export async function calculateEVOZNeeded(
  missingEVOZX
) {

  const rate =
    await getRate();

  return (
    Number(missingEVOZX) *
    rate
  );
}

// =====================================
// BUY EVOZX
// =====================================

export async function buyEVOZX(
  evozAmount
) {

  try {

    const exchange =
      await getExchangeWrite();

    const tx =
      await exchange.buyEVOZX({

        value:
          parseEther(
            String(
              evozAmount
            )
          )

      });

    await tx.wait();

    return tx.hash;

  } catch (error) {

    console.error(
      "Buy EVOZX error:",
      error
    );

    throw error;
  }
}

// =====================================
// AUTO TOPUP
// =====================================

export async function autoTopupEVOZX(
  currentBalance,
  requiredBalance
) {

  const current =
    Number(currentBalance);

  const required =
    Number(requiredBalance);

  if (
    current >= required
  ) {

    return {
      success: true,
      purchased: false,
      needed: 0
    };
  }

  const missing =
    required -
    current;

  const evozNeeded =
    await calculateEVOZNeeded(
      missing
    );

  const txHash =
    await buyEVOZX(
      evozNeeded
    );

  return {

    success: true,

    purchased: true,

    missing,

    evozNeeded,

    txHash

  };
      }
