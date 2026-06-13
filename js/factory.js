import { BrowserProvider, Contract } from "https://esm.sh/ethers@6";

import { CONTRACTS } from "./config.js";
import { getSigner } from "./wallet.js";

let FACTORY_ABI = null;
let EVOZX_ABI = null;

// ===============================
// LOAD ABI (CACHE)
// ===============================

async function loadFactoryAbi() {

  if (FACTORY_ABI) return FACTORY_ABI;

  const response =
    await fetch("./abi/factory.json");

  FACTORY_ABI =
    await response.json();

  return FACTORY_ABI;
}

async function loadEvozxAbi() {

  if (EVOZX_ABI) return EVOZX_ABI;

  const response =
    await fetch("./abi/evozx.json");

  EVOZX_ABI =
    await response.json();

  return EVOZX_ABI;
}

// ===============================
// PROVIDER (READ ONLY)
// ===============================

function getReadProvider() {

  if (!window.ethereum) return null;

  return new BrowserProvider(window.ethereum);
}

// ===============================
// CONTRACT (READ)
// ===============================

async function getFactoryRead() {

  const provider =
    getReadProvider();

  if (!provider) {
    throw new Error("Provider not available.");
  }

  const abi =
    await loadFactoryAbi();

  return new Contract(
    CONTRACTS.FACTORY,
    abi,
    provider
  );
}

// ===============================
// CONTRACT (WRITE)
// ===============================

async function getFactoryWrite() {

  const signer =
    getSigner();

  if (!signer) {
    throw new Error("Wallet not connected.");
  }

  const abi =
    await loadFactoryAbi();

  return new Contract(
    CONTRACTS.FACTORY,
    abi,
    signer
  );
}

// ===============================
// BASIC INFO (READ)
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
// CORE READ FUNCTIONS
// ===============================

export async function symbolExists(symbol) {

  const factory =
    await getFactoryRead();

  return await factory.symbolExists(symbol);
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
// DEPLOYMENT FEE (READ)
// ===============================

export async function getDeploymentFee() {

  try {

    const factory =
      await getFactoryRead();

    return await factory.getDeploymentFee();

  } catch (error) {

    console.error(error);
    return null;
  }
}

// ===============================
// WRITE EXAMPLE (DEPLOY NANTI)
// ===============================

export async function getFactoryForWrite() {

  return await getFactoryWrite();
}
