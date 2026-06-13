import { BrowserProvider, Contract } from "https://esm.sh/ethers@6";
import { CONTRACTS } from "./config.js";
import { getSigner } from "./wallet.js";

let FACTORY_ABI = null;
let EVOZX_ABI = null;

// ===============================
// ABI LOADER (CACHE SAFE)
// ===============================

async function loadFactoryAbi() {

  if (FACTORY_ABI) return FACTORY_ABI;

  try {

    const response =
      await fetch("./abi/factory.json");

    FACTORY_ABI =
      await response.json();

    return FACTORY_ABI;

  } catch (error) {

    console.error("ABI load error:", error);
    return null;
  }
}

async function loadEvozxAbi() {

  if (EVOZX_ABI) return EVOZX_ABI;

  try {

    const response =
      await fetch("./abi/evozx.json");

    EVOZX_ABI =
      await response.json();

    return EVOZX_ABI;

  } catch (error) {

    console.error("ABI load error:", error);
    return null;
  }
}

// ===============================
// READ PROVIDER (SAFE)
// ===============================

function getReadProvider() {

  if (!window.ethereum) return null;

  return new BrowserProvider(window.ethereum);
}

// ===============================
// READ CONTRACT (SAFE)
// ===============================

async function getFactoryRead() {

  const provider =
    getReadProvider();

  if (!provider) {
    throw new Error("No Web3 provider found.");
  }

  const abi =
    await loadFactoryAbi();

  if (!abi) {
    throw new Error("Factory ABI not loaded.");
  }

  return new Contract(
    CONTRACTS.FACTORY,
    abi,
    provider
  );
}

// ===============================
// WRITE CONTRACT (SAFE)
// ===============================

async function getFactoryWrite() {

  const signer =
    getSigner();

  if (!signer) {
    throw new Error("Wallet not connected.");
  }

  const abi =
    await loadFactoryAbi();

  if (!abi) {
    throw new Error("Factory ABI not loaded.");
  }

  return new Contract(
    CONTRACTS.FACTORY,
    abi,
    signer
  );
}

// ===============================
// BASIC READ FUNCTIONS
// ===============================

export async function getFactoryName() {

  const factory =
    await getFactoryRead();

  return await factory.FACTORY_NAME();
}

export async function getVersion() {

  const factory =
    await getFactoryRead();

  return await factory.LAUNCHKIT_VERSION();
}

export async function getTreasury() {

  const factory =
    await getFactoryRead();

  return await factory.treasury();
}

// ===============================
// CORE FUNCTIONS
// ===============================

export async function symbolExists(symbol) {

  try {

    const factory =
      await getFactoryRead();

    return await factory.symbolExists(symbol);

  } catch (error) {

    console.error("symbolExists error:", error);
    return false;
  }
}

export async function getTotalTokens() {

  const factory =
    await getFactoryRead();

  return await factory.totalTokens();
}

export async function getAllTokens() {

  const factory =
    await getFactoryRead();

  return await factory.getAllTokens();
}

// ===============================
// BASE FEE (FIXED LOGIC)
// ===============================

export async function getDeploymentFee() {

  try {

    const factory =
      await getFactoryRead();

    const base =
      await factory.BASE_FEE();

    const multiplier =
      await factory.feeMultiplier();

    // FINAL FEE = BASE × MULTIPLIER
    return {
      base,
      multiplier,
      total: base * multiplier
    };

  } catch (error) {

    console.error("getDeploymentFee error:", error);

    return {
      base: 0,
      multiplier: 1,
      total: 0
    };
  }
}

// ===============================
// WRITE ACCESS (FOR STEP 6)
// ===============================

export async function getFactoryForWrite() {

  return await getFactoryWrite();
}
