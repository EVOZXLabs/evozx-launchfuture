import { BrowserProvider } from "https://esm.sh/ethers@6";
import { NETWORK } from "./config.js";

let provider = null;
let signer = null;
let currentAccount = null;

// ======================================
// NETWORK LOGIC
// ======================================

export async function checkNetwork() {
    if (!window.ethereum) return false;
    try {
        const chainId = await window.ethereum.request({ method: "eth_chainId" });
        return chainId.toLowerCase() === NETWORK.chainHex.toLowerCase();
    } catch (error) {
        console.error("Network check error:", error);
        return false;
    }
}

export async function switchToEVOZ() {
    if (!window.ethereum) throw new Error("Wallet not detected");
    try {
        await window.ethereum.request({
            method: "wallet_switchEthereumChain",
            params: [{ chainId: NETWORK.chainHex }]
        });
    } catch (error) {
        if (error.code === 4902) {
            await window.ethereum.request({
                method: "wallet_addEthereumChain",
                params: [{
                    chainId: NETWORK.chainHex,
                    chainName: NETWORK.chainName,
                    rpcUrls: NETWORK.rpcUrls,
                    blockExplorerUrls: NETWORK.blockExplorerUrls,
                    nativeCurrency: NETWORK.nativeCurrency
                }]
            });
        } else {
            throw error;
        }
    }
}

// ======================================
// CONNECTION LOGIC
// ======================================

export async function connectWallet() {
    if (!window.ethereum) {
        alert("Web3 wallet not detected.");
        return null;
    }
    try {
        if (!(await checkNetwork())) await switchToEVOZ();

        await window.ethereum.request({ method: "eth_requestAccounts" });
        
        provider = new BrowserProvider(window.ethereum);
        signer = await provider.getSigner();
        currentAccount = await signer.getAddress();

        localStorage.setItem("walletConnected", "true");
        updateWalletButtons();
        return currentAccount;
    } catch (error) {
        console.error("Connect error:", error);
        return null;
    }
}

export async function restoreConnection() {
    if (localStorage.getItem("walletConnected") !== "true" || !window.ethereum) return;

    try {
        const accounts = await window.ethereum.request({ method: "eth_accounts" });
        if (!accounts.length) {
            disconnectWallet();
            return;
        }
        provider = new BrowserProvider(window.ethereum);
        signer = await provider.getSigner();
        currentAccount = accounts[0];
        updateWalletButtons();
    } catch (error) {
        console.error("Restore error:", error);
        disconnectWallet();
    }
}

export function disconnectWallet() {
    localStorage.removeItem("walletConnected");
    provider = null;
    signer = null;
    currentAccount = null;
    updateWalletButtons();
}

// ======================================
// GETTERS & HELPERS
// ======================================

export const getProvider = () => provider;
export const getSigner = () => signer;
export const getAccount = () => currentAccount;
export const isConnected = () => !!currentAccount;

export function shortAddress(address) {
    if (!address) return "";
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export function updateWalletButtons() {
    document.querySelectorAll("#connectBtn").forEach((btn) => {
        if (!btn) return;
        if (currentAccount) {
            btn.textContent = shortAddress(currentAccount);
            btn.dataset.connected = "true";
            btn.title = "Click to disconnect";
        } else {
            btn.textContent = "Connect Wallet";
            btn.dataset.connected = "false";
            btn.title = "";
        }
    });
}

// ======================================
// EVENTS
// ======================================

window.addEventListener("DOMContentLoaded", restoreConnection);

if (window.ethereum) {
    window.ethereum.on("accountsChanged", (accounts) => {
        if (!accounts.length) disconnectWallet();
        else {
            currentAccount = accounts[0];
            updateWalletButtons();
        }
    });

    window.ethereum.on("chainChanged", () => window.location.reload());
  }
