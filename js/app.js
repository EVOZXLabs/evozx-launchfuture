import { connectWallet, disconnectWallet, getAccount } from "./wallet.js";
import { NETWORK } from "./config.js";

// =====================================================
// ELEMENTS
// =====================================================
const connectBtn = document.getElementById("connectBtn");
const launchBtn = document.getElementById("launchBtn");
const addNetworkBtn = document.getElementById("addNetworkBtn");

// =====================================================
// UI LOGIC
// =====================================================
function updateConnectUI() {
    if (!connectBtn) return;
    
    const address = getAccount();
    if (address) {
        // Tampilkan format pendek alamat wallet
        connectBtn.textContent = `${address.slice(0, 6)}...${address.slice(-4)}`;
    } else {
        connectBtn.textContent = "Connect Wallet";
    }
}

// Auto-sync listeners
if (window.ethereum) {
    window.ethereum.on('accountsChanged', () => window.location.reload());
    window.ethereum.on('chainChanged', () => window.location.reload());
}

// =====================================================
// HANDLERS
// =====================================================

// Handle Connect/Disconnect
connectBtn?.addEventListener("click", async () => {
    try {
        const connected = getAccount();
        if (connected) {
            if (confirm("Disconnect wallet?")) {
                disconnectWallet();
                updateConnectUI();
            }
        } else {
            await connectWallet();
            updateConnectUI();
        }
    } catch (err) {
        console.error("Connection Error:", err);
        alert("Failed to connect wallet: " + (err.message || "Unknown error"));
    }
});

// Handle Launch Navigation
launchBtn?.addEventListener("click", () => {
    window.location.href = "./launch.html";
});

// Handle Add Network
addNetworkBtn?.addEventListener("click", async () => {
    if (!window.ethereum) return alert("MetaMask not installed!");
    
    try {
        await window.ethereum.request({
            method: "wallet_addEthereumChain",
            params: [{
                chainId: `0x${NETWORK.chainId.toString(16)}`, // Konversi otomatis dari 805 ke hex
                chainName: NETWORK.chainName,
                nativeCurrency: NETWORK.nativeCurrency,
                rpcUrls: NETWORK.rpcUrls,
                blockExplorerUrls: NETWORK.blockExplorerUrls
            }]
        });
        alert("Network added successfully!");
    } catch (error) {
        console.error("Add Network Error:", error);
        alert("Failed to add network: " + error.message);
    }
});

// Initial Load
window.addEventListener("DOMContentLoaded", () => {
    updateConnectUI();
});
