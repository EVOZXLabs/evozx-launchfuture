import { symbolExists, createToken } from "./factory.js";
import { FEES } from "./config.js";

// =====================================================
// ELEMENTS
// =====================================================
const tokenName = document.getElementById("tokenName");
const tokenSymbol = document.getElementById("symbolInput");
const tokenSupply = document.getElementById("tokenSupply");
const deployBtn = document.getElementById("deployBtn");

// Checkboxes & Inputs
const burnable = document.getElementById("burnable");
const mintable = document.getElementById("mintable");
const ownership = document.getElementById("ownership");
const maxWallet = document.getElementById("maxWalletEnabled");
const maxTx = document.getElementById("maxTxEnabled");
const tradingControl = document.getElementById("tradingControlEnabled");

const buyTax = document.getElementById("buyTax");
const sellTax = document.getElementById("sellTax");
const website = document.getElementById("website");
const telegram = document.getElementById("telegram");
const twitter = document.getElementById("twitter");
const logoURI = document.getElementById("logoURI");

// =====================================================
// CONFIG BUILDER (Penyebab Eror "Missing Value" diperbaiki di sini)
// =====================================================
export function buildTokenConfig() {
    return {
        name: tokenName.value,
        symbol: tokenSymbol.value,
        supply: tokenSupply.value,
        
        // Flags (Harus dikirim semua agar tidak "missing value")
        burnable: burnable.checked,
        mintable: mintable.checked,
        ownership: ownership.checked,
        maxWalletEnabled: maxWallet.checked,
        maxTxEnabled: maxTx.checked,
        tradingControlEnabled: tradingControl.checked,
        
        // Values
        maxWallet: maxWallet.checked ? (document.getElementById("maxWalletInput")?.value || 0) : 0,
        maxTx: maxTx.checked ? (document.getElementById("maxTxInput")?.value || 0) : 0,
        buyTax: buyTax.value || 0,
        sellTax: sellTax.value || 0,
        
        // Socials
        website: website.value || "",
        telegram: telegram.value || "",
        twitter: twitter.value || "",
        logoURI: logoURI.value || ""
    };
}

// =====================================================
// DEPLOY HANDLER
// =====================================================
deployBtn?.addEventListener("click", async () => {
    try {
        deployBtn.disabled = true;
        deployBtn.textContent = "Deploying...";
        
        const config = buildTokenConfig();
        const tx = await createToken(config);
        
        alert("Transaction submitted! Please wait for confirmation.");
        await tx.wait();
        alert("Success! Token deployed.");
        
        deployBtn.textContent = "Deploy Token";
        deployBtn.disabled = false;
    } catch (e) {
        console.error("Deploy Error:", e);
        alert("Deploy failed: " + (e.reason || e.message || "Unknown error"));
        deployBtn.disabled = false;
        deployBtn.textContent = "Deploy Token";
    }
});

// =====================================================
// FEE ENGINE & UI
// =====================================================
function calculate() {
    let feature = 0;
    if (burnable?.checked) feature += FEES.BURNABLE;
    if (mintable?.checked) feature += FEES.MINTABLE;
    if (ownership?.checked) feature += FEES.OWNERSHIP;
    if (maxWallet?.checked) feature += FEES.MAX_WALLET;
    if (maxTx?.checked) feature += FEES.MAX_TX;
    if (tradingControl?.checked) feature += FEES.TRADING_CONTROL;
    
    if ((parseFloat(buyTax?.value) || 0) > 0 || (parseFloat(sellTax?.value) || 0) > 0) feature += FEES.TAX;
    
    // Update Stats (DOM check)
    const total = FEES.BASE + feature;
    const setText = (id, val) => { const el = document.getElementById(id); if(el) el.textContent = val; };
    
    setText("baseFee", `${FEES.BASE} EVOZX`);
    setText("featureFee", `${feature} EVOZX`);
    setText("totalFee", `${total} EVOZX`);
    setText("burnAmount", `${(total * 0.30).toFixed(2)} EVOZX`);
    setText("treasuryAmount", `${(total * 0.70).toFixed(2)} EVOZX`);
}

// Event listeners tetap sama
[burnable, mintable, ownership, maxWallet, maxTx, tradingControl].forEach(el => el?.addEventListener("change", calculate));
[tokenName, tokenSymbol, tokenSupply, buyTax, sellTax, website, telegram, twitter, logoURI].forEach(el => el?.addEventListener("input", calculate));

window.addEventListener("DOMContentLoaded", calculate);
