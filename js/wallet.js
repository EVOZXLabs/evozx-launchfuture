import { BrowserProvider } from "https://esm.sh/ethers@6";

let provider = null;
let signer = null;
let currentAccount = null;

export async function checkNetwork() {

  if (!window.ethereum) return false;

  const chainId = await window.ethereum.request({
    method: "eth_chainId"
  });

  if (chainId !== "0x325") {

    alert("Please switch to EVOZ Network");
    return false;
  }

  return true;
}

export async function connectWallet() {

  if (!window.ethereum) {

    alert(
      "Web3 wallet not detected."
    );

    return null;
  }

  try {

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

    console.error(error);

    return null;
  }
}

export async function restoreConnection() {

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

    localStorage.removeItem(
      "walletConnected"
    );

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
}

export function disconnectWallet() {

  localStorage.removeItem(
    "walletConnected"
  );

  provider = null;
  signer = null;
  currentAccount = null;

  updateWalletButtons();
}

export function getProvider() {
  return provider;
}

export function getSigner() {
  return signer;
}

export function getAccount() {
  return currentAccount;
}

export function shortAddress(address) {

  if (!address) return "";

  return (
    address.slice(0, 6) +
    "..." +
    address.slice(-4)
  );
}

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

    } else {

      btn.textContent =
      "Connect Wallet";

      btn.dataset.connected =
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

  }
