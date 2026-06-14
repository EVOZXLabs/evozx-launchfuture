import { symbolExists } from "./factory.js";
import { FEES } from "./config.js";

// =====================================================
// ELEMENTS
// =====================================================
const tokenName = document.getElementById("tokenName");
const tokenSymbol = document.getElementById("symbolInput"); 
const tokenSupply = document.getElementById("tokenSupply");
const deployBtn = document.getElementById("deployBtn");

// Checkboxes
const burnable = document.getElementById("burnable");
const mintable = document.getElementById("mintable");
const ownership = document.getElementById("ownership");
const maxWallet = document.getElementById("maxWalletEnabled");
const maxTx = document.getElementById("maxTxEnabled");
const tradingControl = document.getElementById("tradingControlEnabled");

// Inputs
const buyTax = document.getElementById("buyTax");
const sellTax = document.getElementById("sellTax");
const website = document.getElementById("website");
const telegram = document.getElementById("telegram");
const twitter = document.getElementById("twitter");
const logoURI = document.getElementById("logoURI");

// Stats Labels
const featureFee = document.getElementById("featureFee");
const totalFee = document.getElementById("totalFee");
const burnAmount = document.getElementById("burnAmount");
const treasuryAmount = document.getElementById("treasuryAmount");
const baseFeeEl = document.getElementById("baseFee");
const symbolStatus = document.getElementById("symbolStatus");

// =====================================================
// STATE & HELPERS
// =====================================================
let baseFeeValue = FEES.BASE;
let isSymbolValid = false;
let isCheckingSymbol = false;

const setText = (el, val) => el && (el.textContent = val);

// Mengambil nilai input dengan aman. Jika checkbox mati, return 0.
const getSafeValue = (checkbox, inputEl) => {
    if (!checkbox?.checked) return 0;
    return parseFloat(inputEl?.value) || 0;
};

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
    
    // Tax & Social Link Fees
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

// =====================================================
// DEPLOY BUTTON STATE
// =====================================================
function updateDeployState() {
    if (!deployBtn) return;

    const nameValid = tokenName?.value?.trim()?.length >= 2;
    const symbolValid = tokenSymbol?.value?.trim()?.length >= 2 && isSymbolValid;
    const supplyValid = Number(tokenSupply?.value) > 0;

    const valid = nameValid && symbolValid && supplyValid && !isCheckingSymbol;

    deployBtn.disabled = !valid;
    deployBtn.style.opacity = valid ? "1" : "0.5";
}

// =====================================================
// SYMBOL CHECK
// =====================================================
let symbolTimeout;
tokenSymbol?.addEventListener("input", () => {
    clearTimeout(symbolTimeout);
    const symbol = tokenSymbol.value.trim();
    isSymbolValid = false;

    if (!symbol) {
        setText(symbolStatus, "");
        updateDeployState();
        return;
    }

    setText(symbolStatus, "Checking...");
    symbolStatus.style.color = "#999";
    isCheckingSymbol = true;
    updateDeployState();

    symbolTimeout = setTimeout(async () => {
        try {
            const exists = await symbolExists(symbol);
            if (exists) {
                isSymbolValid = false;
                setText(symbolStatus, "❌ Symbol taken");
                symbolStatus.style.color = "#ff4d4f";
            } else {
                isSymbolValid = true;
                setText(symbolStatus, "✅ Available");
                symbolStatus.style.color = "#52c41a";
            }
        } catch (error) {
            console.error(error);
            isSymbolValid = false;
            setText(symbolStatus, "⚠️ Error");
        }
        isCheckingSymbol = false;
        updateDeployState();
    }, 600);
});

// =====================================================
// EVENT LISTENERS
// =====================================================
const allInputs = [tokenName, tokenSymbol, tokenSupply, buyTax, sellTax, website, telegram, twitter, logoURI];
const allToggles = [burnable, mintable, ownership, maxWallet, maxTx, tradingControl];

allToggles.forEach(el => el?.addEventListener("change", calculate));
allInputs.forEach(el => el?.addEventListener("input", calculate));

window.addEventListener("DOMContentLoaded", () => {
    calculate();
    updateDeployState();
});
            
