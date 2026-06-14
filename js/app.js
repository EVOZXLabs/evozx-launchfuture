import { connectWallet, disconnectWallet, getAccount } from "./wallet.js";

// =====================================================
// ELEMENTS
// =====================================================
const connectBtn = document.getElementById("connectBtn");
const launchBtn = document.getElementById("launchBtn");
const addNetworkBtn = document.getElementById("addNetworkBtn");

// Helper untuk memperbarui teks tombol sesuai status koneksi
function updateConnectUI() {
    const address = getAccount();
    if (connectBtn) {
        if (address) {
            // Menampilkan alamat singkat jika terhubung
            connectBtn.textContent = `${address.slice(0, 6)}...${address.slice(-4)}`;
        } else {
            connectBtn.textContent = "Connect Wallet";
        }
    }
}

// =====================================================
// EVENTS
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

    await connectWallet();
    updateConnectUI();
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
                chainId: "0x325", // Sesuaikan dengan Chain ID EVOZ
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
        alert("Network added/switched successfully!");
    } catch (error) {
        console.error("Failed to add network:", error);
    }
});

// =====================================================
// INIT
// =====================================================
// Jalankan saat halaman dimuat untuk mengecek status wallet
window.addEventListener("DOMContentLoaded", () => {
    updateConnectUI();
});
