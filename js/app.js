import { connectWallet, disconnectWallet, getAccount } from "./wallet.js";

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
        connectBtn.textContent = `${address.slice(0, 6)}...${address.slice(-4)}`;
    } else {
        connectBtn.textContent = "Connect Wallet";
    }
}

// Event Listeners untuk perubahan dari Wallet (MetaMask)
if (window.ethereum) {
    window.ethereum.on('accountsChanged', () => {
        updateConnectUI();
        window.location.reload(); // Refresh halaman agar data sinkron
    });
    
    window.ethereum.on('chainChanged', () => {
        window.location.reload();
    });
}

// =====================================================
// HANDLERS
// =====================================================

// Connect/Disconnect Logic
connectBtn?.addEventListener("click", async () => {
    const connected = getAccount();

    if (connected) {
        if (confirm("Disconnect wallet?")) {
            disconnectWallet();
            updateConnectUI();
        }
        return;
    }

    try {
        await connectWallet();
        updateConnectUI();
    } catch (err) {
        console.error("Connection failed:", err);
    }
});

// Navigation Logic
launchBtn?.addEventListener("click", () => {
    window.location.href = "./launch.html";
});

// Add Network Logic
addNetworkBtn?.addEventListener("click", async () => {
    if (!window.ethereum) {
        alert("Wallet not detected. Please install MetaMask/TrustWallet.");
        return;
    }

    try {
        await window.ethereum.request({
            method: "wallet_addEthereumChain",
            params: [{
                chainId: "0x325", // 805 decimal
                chainName: "EVOZ Mainnet",
                nativeCurrency: {
                    name: "EVOZ",
                    symbol: "EVOZ",
                    decimals: 18
                },
                rpcUrls: ["https://rpc.evozscan.com"],
                blockExplorerUrls: ["https://evozscan.com"]
            }]
        });
        alert("Network added or switched successfully!");
    } catch (error) {
        console.error("Failed to add network:", error);
        alert("Failed to add network. Please try again.");
    }
});

// =====================================================
// INIT
// =====================================================
window.addEventListener("DOMContentLoaded", () => {
    updateConnectUI();
});
