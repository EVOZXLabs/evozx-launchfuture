import { Contract } from "https://esm.sh/ethers@6";

import { CONTRACTS } from "./config.js";

import { getSigner } from "./wallet.js";

let FACTORY_ABI = null;
let EVOZX_ABI = null;

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

export async function getFactory() {

  const signer =
  getSigner();

  if (!signer) {

    throw new Error(
      "Wallet not connected."
    );

  }

  const abi =
  await loadFactoryAbi();

  return new Contract(

    CONTRACTS.FACTORY,

    abi,

    signer

  );

}

export async function getEVOZX() {

  const signer =
  getSigner();

  if (!signer) {

    throw new Error(
      "Wallet not connected."
    );

  }

  const abi =
  await loadEvozxAbi();

  return new Contract(

    CONTRACTS.EVOZX,

    abi,

    signer

  );

}

export async function getFactoryName() {

  const factory =
  await getFactory();

  return await factory.FACTORY_NAME();

}

export async function getVersion() {

  const factory =
  await getFactory();

  return await factory.LAUNCHKIT_VERSION();

}

export async function getTreasury() {

  const factory =
  await getFactory();

  return await factory.treasury();

}

export async function symbolExists(symbol) {

  const factory =
  await getFactory();

  return await factory.symbolExists(
    symbol
  );

}

export async function getTotalTokens() {

  const factory =
  await getFactory();

  return await factory.totalTokens();

}

export async function getAllTokens() {

  const factory =
  await getFactory();

  return await factory.getAllTokens();

}
