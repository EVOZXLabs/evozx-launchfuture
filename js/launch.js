import { symbolExists } from "./factory.js";
import { FEES } from "./config.js";

// =====================================================
// ELEMENTS
// =====================================================
const tokenName = document.getElementById("tokenName");
const tokenSymbol = document.getElementById("symbolInput");
const tokenSupply = document.getElementById("tokenSupply");
const deployBtn = document.getElementById("deployBtn");

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

const featureFee = document.getElementById("featureFee");
const totalFee = document.getElementById("totalFee");
const burnAmount = document.getElementById("burnAmount");
const treasuryAmount = document.getElementById("treasuryAmount");
const baseFeeEl = document.getElementById("baseFee");
const symbolStatus = document.getElementById("symbolStatus");

// =====================================================
// STATE
// =====================================================
let baseFeeValue = FEES.BASE;
let isSymbolValid = false;
let isCheckingSymbol = false;

const setText = (el, val) => el && (el.textContent = val);

// =====================================================
// EXPORT DATA (Fungsi ini dipakai saat klik Deploy)
// =====================================================
export function getFormData() {
    return {
        name: tokenName.value,
        symbol: tokenSymbol.value,
        supply: tokenSupply.value,
        // Jika checkbox tidak aktif, kirim 0, bukan null/empty
        maxWallet: maxWallet.checked ? (document.getElementById("maxWalletInput")?.value || 0) : 0,
        maxTx: maxTx.checked ? (document.getElementById("maxTxInput")?.value || 0) : 0,
        // Pastikan ID elemen input di bawah ini sesuai dengan HTML Anda
        buyTax: buyTax.value || 0,
        sellTax: sellTax.value || 0
    };
}

// =====================================================
// FEE ENGINE
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
    if (website?.value?.trim()) feature += FEES.WEBSITE;
    if (telegram?.value?.trim()) feature += FEES.TELEGRAM;
    if (twitter?.value?.trim()) feature += FEES.TWITTER;
    if (logoURI?.value?.trim()) feature += FEES.LOGO;

    const total = baseFeeValue + feature;

    setText(baseFeeEl, `${baseFeeValue} EVOZX`);
    setText(featureFee, `${feature} EVOZX`);
    setText(totalFee, `${total} EVOZX`);
    setText(burnAmount, `${(total * 0.30).toFixed(2)} EVOZX`);
    setText(treasuryAmount, `${(total * 0.70).toFixed(2)} EVOZX`);

    updateDeployState();
}

function updateDeployState() {
    if (!deployBtn) return;
    const valid = tokenName?.value?.trim()?.length >= 2 && 
                  tokenSymbol?.value?.trim()?.length >= 2 && 
                  isSymbolValid && 
                  Number(tokenSupply?.value) > 0 && 
                  !isCheckingSymbol;

    deployBtn.disabled = !valid;
    deployBtn.style.opacity = valid ? "1" : "0.5";
}

// ... (Simbol check tetap sama) ...
tokenSymbol?.addEventListener("input", () => {
    // [Kode pengecekan simbol tetap seperti sebelumnya]
    // ...
});

// Event Listeners
[burnable, mintable, ownership, maxWallet, maxTx, tradingControl].forEach(el => el?.addEventListener("change", calculate));
[tokenName, tokenSymbol, tokenSupply, buyTax, sellTax, website, telegram, twitter, logoURI].forEach(el => el?.addEventListener("input", calculate));

window.addEventListener("DOMContentLoaded", calculate);
