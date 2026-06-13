import { Contract } from "https://esm.sh/ethers@6";

import {
  connectWallet,
  switchToEVOZ
} from "./wallet.js";

import {
  CONTRACTS
} from "./config.js";

let factory = null;
let walletData = null;

const connectBtn =
  document.getElementById("connectBtn");

const totalTokensEl =
  document.getElementById("totalTokens");

const factoryVersionEl =
  document.getElementById("factoryVersion");

const launchkitVersionEl =
  document.getElementById("launchkitVersion");

const factoryNameEl =
  document.getElementById("factoryName");

function shortAddress(address) {

  if (!address) return "";

  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

async function loadFactoryAbi() {

  const response =
    await fetch("./abi/factory.json");

  if (!response.ok) {
    throw new Error(
      "Unable to load Factory ABI"
    );
  }

  return await response.json();
}

async function initializeFactory() {

  const abi = await loadFactoryAbi();

  factory = new Contract(
    CONTRACTS.FACTORY,
    abi,
    walletData.signer
  );
}

async function loadFactoryInfo() {

  if (!factory) return;

  try {

    if (typeof factory.FACTORY_NAME === "function") {

      const name =
        await factory.FACTORY_NAME();

      if (factoryNameEl) {
        factoryNameEl.textContent = name;
      }
    }

  } catch (error) {

    console.warn(
      "FACTORY_NAME not found",
      error
    );

  }

  try {

    if (typeof factory.VERSION === "function") {

      const version =
        await factory.VERSION();

      if (factoryVersionEl) {
        factoryVersionEl.textContent =
          version;
      }
    }

  } catch (error) {

    console.warn(
      "VERSION not found",
      error
    );

  }

  try {

    if (
      typeof factory.LAUNCHKIT_VERSION ===
      "function"
    ) {

      const version =
        await factory.LAUNCHKIT_VERSION();

      if (launchkitVersionEl) {
        launchkitVersionEl.textContent =
          version;
      }
    }

  } catch (error) {

    console.warn(
      "LAUNCHKIT_VERSION not found",
      error
    );

  }
}

async function loadStatistics() {

  if (!factory) return;

  try {

    const total =
      await factory.totalTokens();

    if (totalTokensEl) {
      totalTokensEl.textContent =
        total.toString();
    }

  } catch (error) {

    console.error(
      "Failed loading statistics",
      error
    );
  }
}

async function connect() {

  try {

    connectBtn.disabled = true;
    connectBtn.textContent =
      "Connecting...";

    await switchToEVOZ();

    walletData =
      await connectWallet();

    connectBtn.textContent =
      shortAddress(walletData.address);

    await initializeFactory();

    await loadFactoryInfo();

    await loadStatistics();

  } catch (error) {

    console.error(error);

    alert(
      error.message ||
      "Wallet connection failed"
    );

    connectBtn.textContent =
      "Connect Wallet";

  } finally {

    connectBtn.disabled = false;
  }
}

async function autoReconnect() {

  try {

    if (!window.ethereum) {
      return;
    }

    const accounts =
      await window.ethereum.request({
        method: "eth_accounts"
      });

    if (!accounts.length) {
      return;
    }

    await switchToEVOZ();

    walletData =
      await connectWallet();

    connectBtn.textContent =
      shortAddress(walletData.address);

    await initializeFactory();

    await loadFactoryInfo();

    await loadStatistics();

  } catch (error) {

    console.warn(
      "Auto reconnect skipped",
      error
    );
  }
}

function setupWalletEvents() {

  if (!window.ethereum) return;

  window.ethereum.on(
    "accountsChanged",
    () => {
      window.location.reload();
    }
  );

  window.ethereum.on
