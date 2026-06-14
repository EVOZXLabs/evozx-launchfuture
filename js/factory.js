import {
  BrowserProvider,
  Contract
} from "https://esm.sh/ethers@6";

import {
  CONTRACTS
} from "./config.js";

import {
  getSigner
} from "./wallet.js";

// =====================================
// ABI CACHE
// =====================================

let FACTORY_ABI = null;
let EVOZX_ABI = null;

// =====================================
// ABI LOADER
// =====================================

async function loadFactoryAbi() {

  if (FACTORY_ABI)
    return FACTORY_ABI;

  try {

    const response =
      await fetch(
        "./abi/factory.json"
      );

    FACTORY_ABI =
      await response.json();

    return FACTORY_ABI;

  } catch (error) {

    console.error(
      "Factory ABI load error:",
      error
    );

    return null;
  }
}

async function loadEvozxAbi() {

  if (EVOZX_ABI)
    return EVOZX_ABI;

  try {

    const response =
      await fetch(
        "./abi/evozx.json"
      );

    EVOZX_ABI =
      await response.json();

    return EVOZX_ABI;

  } catch (error) {

    console.error(
      "EVOZX ABI load error:",
      error
    );

    return null;
  }
}

// =====================================
// PROVIDER
// =====================================

function getReadProvider() {

  if (!window.ethereum) {

    throw new Error(
      "No wallet detected"
    );
  }

  return new BrowserProvider(
    window.ethereum
  );
}

// =====================================
// FACTORY READ
// =====================================

async function getFactoryRead() {

  const provider =
    getReadProvider();

  const abi =
    await loadFactoryAbi();

  if (!abi) {

    throw new Error(
      "Factory ABI missing"
    );
  }

  return new Contract(
    CONTRACTS.FACTORY,
    abi,
    provider
  );
}

// =====================================
// FACTORY WRITE
// =====================================

async function getFactoryWrite() {

  const signer =
    getSigner();

  if (!signer) {

    throw new Error(
      "Wallet not connected"
    );
  }

  const abi =
    await loadFactoryAbi();

  if (!abi) {

    throw new Error(
      "Factory ABI missing"
    );
  }

  return new Contract(
    CONTRACTS.FACTORY,
    abi,
    signer
  );
}

// =====================================
// EVOZX CONTRACT
// =====================================

async function getEVOZXRead() {

  const provider =
    getReadProvider();

  const abi =
    await loadEvozxAbi();

  if (!abi) {

    throw new Error(
      "EVOZX ABI missing"
    );
  }

  return new Contract(
    CONTRACTS.EVOZX,
    abi,
    provider
  );
}

async function getEVOZXWrite() {

  const signer =
    getSigner();

  const abi =
    await loadEvozxAbi();

  if (!abi) {

    throw new Error(
      "EVOZX ABI missing"
    );
  }

  return new Contract(
    CONTRACTS.EVOZX,
    abi,
    signer
  );
}

// =====================================
// FACTORY INFO
// =====================================

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

// =====================================
// SYMBOL CHECK
// =====================================

export async function symbolExists(
  symbol
) {

  try {

    const factory =
      await getFactoryRead();

    return await factory.symbolExists(
      symbol
    );

  } catch (error) {

    console.error(
      "symbolExists error:",
      error
    );

    return false;
  }
}

// =====================================
// DEPLOYMENT FEE
// =====================================

export async function getDeploymentFee(
  config
) {

  try {

    const factory =
      await getFactoryRead();

    const fee =
      await factory.getDeploymentFee(
        config
      );

    return fee;

  } catch (error) {

    console.error(
      "getDeploymentFee error:",
      error
    );

    return 0n;
  }
}

// =====================================
// DEPLOY TOKEN
// =====================================

export async function createToken(
  config
) {

  const factory =
    await getFactoryWrite();

  const tx =
    await factory.createToken(
      config
    );

  return tx;
}

// =====================================
// EVOZX APPROVAL
// =====================================

export async function approveEVOZX(
  amount
) {

  const token =
    await getEVOZXWrite();

  const tx =
    await token.approve(
      CONTRACTS.FACTORY,
      amount
    );

  return tx;
}

// =====================================
// EVOZX BALANCE
// =====================================

export async function getEVOZXBalance(
  wallet
) {

  try {

    const token =
      await getEVOZXRead();

    return await token.balanceOf(
      wallet
    );

  } catch (error) {

    console.error(
      "balance error:",
      error
    );

    return 0n;
  }
}

// =====================================
// FACTORY WRITE ACCESS
// =====================================

export async function getFactoryForWrite() {

  return await getFactoryWrite();
}
