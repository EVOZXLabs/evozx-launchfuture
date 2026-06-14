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

// Auto-sync jika user ganti akun/chain
if (window.ethereum) {
    window.ethereum.on('accountsChanged', () => window.location.reload());
    window.ethereum.on('chainChanged', () => window.location.reload());
}

// =====================================================
// HANDLERS
// =====================================================

connectBtn?.addEventListener("click", async () => {
    const connected = getAccount();
    if (connected) {
        if (confirm("Disconnect wallet?")) {
            disconnectWallet();
            updateConnectUI();
        }
        return;
    }
    await connectWallet();
    updateConnectUI();
});

launchBtn?.addEventListener("click", () => {
    window.location.href = "./launch.html";
});

addNetworkBtn?.addEventListener("click", async () => {
    if (!window.ethereum) return alert("Wallet not detected.");
    try {
        await window.ethereum.request({
            method: "wallet_addEthereumChain",
            params: [{
                chainId: "0x325",
                chainName: "EVOZ Mainnet",
                nativeCurrency: { name: "EVOZ", symbol: "EVOZ", decimals: 18 },
                rpcUrls: ["https://rpc.evozscan.com"],
                blockExplorerUrls: ["https://evozscan.com"]
            }]
        });
    } catch (error) {
        console.error(error);
    }
});

window.addEventListener("DOMContentLoaded", updateConnectUI);
