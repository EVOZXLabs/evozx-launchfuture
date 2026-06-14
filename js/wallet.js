import { BrowserProvider } from "https://esm.sh/ethers@6";
import { NETWORK } from "./config.js";

let provider = null;
let signer = null;
let currentAccount = null;

// ======================================
// NETWORK CHECK
// ======================================

export async function checkNetwork() {

  if (!window.ethereum) {
    return false;
  }

  try {

    const chainId =
      await window.ethereum.request({
        method: "eth_chainId"
      });

    return (
      chainId.toLowerCase() ===
      NETWORK.chainHex.toLowerCase()
    );

  } catch (error) {

    console.error(
      "Network check error:",
      error
    );

    return false;
  }
}

// ======================================
// SWITCH NETWORK
// ======================================

export async function switchToEVOZ() {

  if (!window.ethereum) {
    throw new Error(
      "Wallet not detected"
    );
  }

  try {

    await window.ethereum.request({
      method: "wallet_switchEthereumChain",
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
        method: "wallet_addEthereumChain",
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

// ======================================
// CONNECT
// ======================================

export async function connectWallet() {

  if (!window.ethereum) {

    alert(
      "Web3 wallet not detected."
    );

    return null;
  }

  try {

    const isCorrectNetwork =
      await checkNetwork();

    if (!isCorrectNetwork) {

      await switchToEVOZ();
    }

    await window.ethereum.request({
      method: "eth_requestAccounts"
    });

    provider =
      new BrowserProvider(
        window.ethereum
      );

    signer =
      await provider.getSigner();

    currentAccount =
      await signer.getAddress();

    localStorage.setItem(
      "walletConnected",
      "true"
    );

    updateWalletButtons();

    return currentAccount;

  } catch (error) {

    console.error(
      "Connect error:",
      error
    );

    return null;
  }
}

// ======================================
// RESTORE SESSION
// ======================================

export async function restoreConnection() {

  try {

    if (
      localStorage.getItem(
        "walletConnected"
      ) !== "true"
    ) {
      return;
    }

    if (!window.ethereum) {
      return;
    }

    const accounts =
      await window.ethereum.request({
        method: "eth_accounts"
      });

    if (!accounts.length) {

      disconnectWallet();

      return;
    }

    provider =
      new BrowserProvider(
        window.ethereum
      );

    signer =
      await provider.getSigner();

    currentAccount =
      accounts[0];

    updateWalletButtons();

  } catch (error) {

    console.error(
      "Restore error:",
      error
    );

    disconnectWallet();
  }
}

// ======================================
// DISCONNECT
// ======================================

export function disconnectWallet() {

  localStorage.removeItem(
    "walletConnected"
  );

  provider = null;
  signer = null;
  currentAccount = null;

  updateWalletButtons();
}

// ======================================
// GETTERS
// ======================================

export function getProvider() {
  return provider;
}

export function getSigner() {
  return signer;
}

export function getAccount() {
  return currentAccount;
}

export function isConnected() {
  return !!currentAccount;
}

// ======================================
// ADDRESS FORMAT
// ======================================

export function shortAddress(
  address
) {

  if (!address) return "";

  return (
    address.slice(0, 6) +
    "..." +
    address.slice(-4)
  );
}

// ======================================
// BUTTON UI
// ======================================

export function updateWalletButtons() {

  const buttons =
    document.querySelectorAll(
      "#connectBtn"
    );

  buttons.forEach((btn) => {

    if (!btn) return;

    if (currentAccount) {

      btn.textContent =
        shortAddress(
          currentAccount
        );

      btn.dataset.connected =
        "true";

      btn.title =
        "Click to disconnect";

    } else {

      btn.textContent =
        "Connect Wallet";

      btn.dataset.connected =
        "false";

      btn.title =
        "";
    }
  });
}

// ======================================
// AUTO INIT
// ======================================

window.addEventListener(
  "DOMContentLoaded",
  async () => {

    await restoreConnection();
  }
);

// ======================================
// WALLET EVENTS
// ======================================

if (window.ethereum) {

  window.ethereum.on(
    "accountsChanged",
    async (accounts) => {

      if (
        !accounts ||
        !accounts.length
      ) {

        disconnectWallet();
        return;
      }

      currentAccount =
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
