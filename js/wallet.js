import { BrowserProvider } from "https://esm.sh/ethers@6";

import { NETWORK } from "./config.js";

let provider = null;
let signer = null;
let userAddress = null;

export async function connectWallet() {
  if (!window.ethereum) {
    throw new Error("Web3 wallet not detected.");
  }

  await window.ethereum.request({
    method: "eth_requestAccounts"
  });

  provider = new BrowserProvider(window.ethereum);

  signer = await provider.getSigner();

  userAddress = await signer.getAddress();

  return {
    provider,
    signer,
    address: userAddress
  };
}

export async function switchToEVOZ() {
  try {
    await window.ethereum.request({
      method: "wallet_switchEthereumChain",
      params: [
        {
          chainId: NETWORK.chainHex
        }
      ]
    });
  } catch (error) {
    if (error.code === 4902) {
      await window.ethereum.request({
        method: "wallet_addEthereumChain",
        params: [
          {
            chainId: NETWORK.chainHex,
            chainName: NETWORK.chainName,

            rpcUrls: NETWORK.rpcUrls,

            blockExplorerUrls:
              NETWORK.blockExplorerUrls,

            nativeCurrency:
              NETWORK.nativeCurrency
          }
        ]
      });
    } else {
      throw error;
    }
  }
}

export async function getProvider() {
  return provider;
}

export async function getSigner() {
  return signer;
}

export async function getAddress() {
  return userAddress;
}
