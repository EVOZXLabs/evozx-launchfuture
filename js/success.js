import { LINKS } from "./config.js";

// =====================================
// ELEMENTS
// =====================================
const tokenAddressEl = document.getElementById("tokenAddress");
const tokenNameEl = document.getElementById("tokenName");
const tokenSymbolEl = document.getElementById("tokenSymbol");
const tokenSupplyEl = document.getElementById("tokenSupply");
const creatorEl = document.getElementById("creator");
const txHashEl = document.getElementById("txHash");

const explorerBtn = document.getElementById("explorerBtn");
const copyAddressBtn = document.getElementById("copyAddressBtn");
const copyTxBtn = document.getElementById("copyTxBtn");

// =====================================
// HELPERS
// =====================================
const setText = (el, val) => el && (el.textContent = val ?? "-");

const shortAddress = (addr) => addr ? `${addr.slice(0, 6)}...${addr.slice(-4)}` : "-";

async function copyText(text) {
    if (!text) return;
    try {
        await navigator.clipboard.writeText(text);
        alert("Copied to clipboard!");
    } catch (e) {
        console.error("Copy error:", e);
    }
}

// =====================================
// RENDER LOGIC
// =====================================
function renderSuccess() {
    const raw = localStorage.getItem("lastDeployedToken");
    const token = raw ? JSON.parse(raw) : null;

    if (!token) {
        setText(tokenAddressEl, "No deployment data found");
        return;
    }

    setText(tokenNameEl, token.name);
    setText(tokenSymbolEl, token.symbol);
    setText(tokenSupplyEl, token.supply);
    setText(creatorEl, shortAddress(token.creator));
    setText(tokenAddressEl, token.token || "Pending");
    setText(txHashEl, shortAddress(token.txHash));

    // Event Listeners
    explorerBtn?.addEventListener("click", () => {
        if (token.txHash) window.open(`${LINKS.TX}${token.txHash}`, "_blank");
    });

    copyAddressBtn?.addEventListener("click", () => copyText(token.token));
    copyTxBtn?.addEventListener("click", () => copyText(token.txHash));
}

// =====================================
// INIT
// =====================================
window.addEventListener("DOMContentLoaded", renderSuccess);
