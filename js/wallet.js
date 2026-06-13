import {
  BrowserProvider
}
from "https://esm.sh/ethers@6";

import {
  NETWORK
}
from "./config.js";

let provider = null;

let signer = null;

let address = null;

export async function connectWallet() {

  if (!window.ethereum) {

    throw new Error(
      "No Web3 wallet detected."
    );

  }

  await window.ethereum.request({

    method:
    "eth_requestAccounts"

  });

  provider =
  new BrowserProvider(
    window.ethereum
  );

  signer =
  await provider.getSigner();

  address =
  await signer.getAddress();

  return {

    provider,

    signer,

    address

  };

}

export async function switchToEVOZ() {

  try {

    await window.ethereum.request({

      method:
      "wallet_switchEthereumChain",

      params: [

        {
          chainId:
          NETWORK.chainHex
        }

      ]

    });

  } catch (error) {

    if (error.code === 4902) {

      await window.ethereum.request({

        method:
        "wallet_addEthereumChain",

        params: [

          {

            chainId:
            NETWORK.chainHex,

            chainName:
            NETWORK.chainName,

            rpcUrls:
            NETWORK.rpcUrls,

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

export function getProvider() {

  return provider;

}

export function getSigner() {

  return signer;

}

export function getAddress() {

  return address;

}
