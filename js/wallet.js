import { BrowserProvider } from "https://esm.sh/ethers@6";

import {
  NETWORK,
  STORAGE_KEYS
} from "./config.js";

let provider = null;
let signer = null;
let account = null;

function hasWallet() {
  return typeof window.ethereum !== "undefined";
}

export function getProvider() {
  return provider;
}

export function getSigner() {
  return signer;
}

export function getAccount() {
  return account;
}

export function isConnected() {
  return account !== null;
}

export function shortAddress(address) {

  if (!address) return "";

  return (
    address.slice(0, 6) +
    "..." +
    address.slice(-4)
  );
}

export async function checkNetwork() {

  if (!hasWallet()) return false;

  const chainId =
    await window.ethereum.request({
      method: "eth_chainId"
    });

  return (
    Number(chainId) === NETWORK.chainId
  );
}

export async function switchToEVOZ() {

  if (!hasWallet()) {

    alert(
      "Web3 wallet not detected."
    );

    return false;
  }

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

    return true;

  } catch (error) {

    if (error.code !== 4902) {

      console.error(error);

      return false;
    }

    try {

      await window.ethereum.request({

        method:
        "wallet_addEthereumChain",

        params: [

          {

            chainId:
            NETWORK.chainHex,

            chainName:
            NETWORK.name,

            nativeCurrency: {

              name:
              NETWORK.currency.name,

              symbol:
              NETWORK.currency.symbol,

              decimals:
              NETWORK.currency.decimals

            },

            rpcUrls: [
              NETWORK.rpc
            ],

            blockExplorerUrls: [
              NETWORK.explorer
            ]

          }

        ]

      });

      return true;

    } catch (err) {

      console.error(err);

      return false;

    }

  }

}

export async function connectWallet() {

  if (!hasWallet()) {

    alert(
      "Web3 wallet not detected."
    );

    return null;

  }

  try {

    const correctNetwork =
      await checkNetwork();

    if (!correctNetwork) {

      const switched =
        await switchToEVOZ();

      if (!switched) {

        return null;

      }

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

    account =
      await signer.getAddress();

    localStorage.setItem(
      STORAGE_KEYS.wallet,
      "true"
    );

    updateWalletButtons();

    return account;

  } catch (error) {

    console.error(error);

    return null;

  }

}

export async function restoreConnection() {

  if (

    localStorage.getItem(
      STORAGE_KEYS.wallet
    ) !== "true"

  ) {

    updateWalletButtons();

    return;

  }

  if (!hasWallet()) {

    updateWalletButtons();

    return;

  }

  const accounts =
    await window.ethereum.request({

      method:
      "eth_accounts"

    });

  if (!accounts.length) {

    disconnectWallet();

    return;

  }

  const correctNetwork =
    await checkNetwork();

  if (!correctNetwork) {

    disconnectWallet();

    return;

  }

  provider =
    new BrowserProvider(
      window.ethereum
    );

  signer =
    await provider.getSigner();

  account =
    accounts[0];

  updateWalletButtons();

}

export function disconnectWallet() {

  provider = null;

  signer = null;

  account = null;

  localStorage.removeItem(
    STORAGE_KEYS.wallet
  );

  updateWalletButtons();

}

export function updateWalletButtons() {

  const buttons =
    document.querySelectorAll(
      "#connectBtn"
    );

  buttons.forEach((button) => {

    if (!button) return;

    if (account) {

      button.textContent =
        shortAddress(account);

      button.dataset.connected =
        "true";

    } else {

      button.textContent =
        "Connect Wallet";

      button.dataset.connected =
        "false";

    }

  });

}

window.addEventListener(

  "DOMContentLoaded",

  async () => {

    await restoreConnection();

  }

);

if (hasWallet()) {

  window.ethereum.on(

    "accountsChanged",

    async (accounts) => {

      if (!accounts.length) {

        disconnectWallet();

        return;

      }

      account =
        accounts[0];

      updateWalletButtons();

    }

  );

  window.ethereum.on(

    "chainChanged",

    () => {

      window.location.reload();

    }

  );

        }
