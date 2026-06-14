import { createToken } from "./factory.js";
import { FEES } from "./config.js";

// =====================================================
// HELPERS
// =====================================================
const getElementValue = (id) => document.getElementById(id)?.value || "";
const getElementChecked = (id) => document.getElementById(id)?.checked || false;
const getCurrentAddress = () => window.ethereum?.selectedAddress || "0x0000000000000000000000000000000000000000";

// =====================================================
// CONFIG BUILDER (WAJIB SESUAI STRUCT SOLIDITY)
// =====================================================
export function buildTokenConfig() {
    const supplyRaw = parseFloat(document.getElementById("tokenSupply")?.value || 0);
    
    // Perhatikan urutan dan field ini harus sama dengan struct TokenConfig di Solidity
    return {
        name: getElementValue("tokenName"),
        symbol: getElementValue("symbolInput"),
        supply: BigInt(Math.floor(supplyRaw * 10**18)), 
        owner: getCurrentAddress(),
        launchKitVersion: 200, 
        
        // Ownership & Core
        ownershipEnabled: getElementChecked("ownership"),
        burnable: getElementChecked("burnable"),
        mintable: getElementChecked("mintable"),
        
        // Metadata
        website: getElementValue("website"),
        telegram: getElementValue("telegram"),
        twitter: getElementValue("twitter"),
        logoURI: getElementValue("logoURI"),
        
        // Security
        maxWalletEnabled: getElementChecked("maxWalletEnabled"),
        maxWalletPercent: parseInt(getElementValue("maxWalletPercent") || 0),
        maxTxEnabled: getElementChecked("maxTxEnabled"),
        maxTxPercent: parseInt(getElementValue("maxTxPercent") || 0),
        tradingControlEnabled: getElementChecked("tradingControlEnabled"),
        tradingEnabled: true, // Default enabled
        
        // Tokenomics & Tax
        buyTaxEnabled: parseInt(getElementValue("buyTax") || 0) > 0,
        buyTax: parseInt(getElementValue("buyTax") || 0),
        sellTaxEnabled: parseInt(getElementValue("sellTax") || 0) > 0,
        sellTax: parseInt(getElementValue("sellTax") || 0),
        burnTaxShare: parseInt(getElementValue("burnTaxShare") || 0),
        marketingWallet: getElementValue("marketingWallet") || "0x0000000000000000000000000000000000000000",
        developmentWallet: getElementValue("developmentWallet") || "0x0000000000000000000000000000000000000000"
    };
}

// =====================================================
// DEPLOY HANDLER
// =====================================================
document.getElementById("deployBtn")?.addEventListener("click", async () => {
    const btn = document.getElementById("deployBtn");
    try {
        btn.disabled = true;
        btn.textContent = "Deploying...";
        
        const config = buildTokenConfig();
        console.log("Mengirim Config ke Contract:", config);
        
        const tx = await createToken(config);
        
        alert("Transaction submitted! Please wait for confirmation.");
        await tx.wait();
        alert("Success! Token deployed.");
        
        btn.textContent = "Deploy Token";
        btn.disabled = false;
    } catch (e) {
        console.error("Deploy Error:", e);
        const msg = e.reason || e.data?.message || e.message || "Unknown error";
        alert("Deploy failed: " + msg);
        btn.disabled = false;
        btn.textContent = "Deploy Token";
    }
});

// =====================================================
// FEE ENGINE
// =====================================================
function calculate() {
    const burnable = getElementChecked("burnable");
    const mintable = getElementChecked("mintable");
    const ownership = getElementChecked("ownership");
    const maxWallet = getElementChecked("maxWalletEnabled");
    const maxTx = getElementChecked("maxTxEnabled");
    const tradingControl = getElementChecked("tradingControlEnabled");
    
    const buyTax = parseInt(getElementValue("buyTax") || 0);
    const sellTax = parseInt(getElementValue("sellTax") || 0);

    let feature = 0;
    if (burnable) feature += FEES.BURNABLE;
    if (mintable) feature += FEES.MINTABLE;
    if (ownership) feature += FEES.OWNERSHIP;
    if (maxWallet) feature += FEES.MAX_WALLET;
    if (maxTx) feature += FEES.MAX_TX;
    if (tradingControl) feature += FEES.TRADING_CONTROL;
    
    if (buyTax > 0 || sellTax > 0) feature += FEES.TAX;
    
    const total = FEES.BASE + feature;
    
    const setText = (id, val) => { const el = document.getElementById(id); if(el) el.textContent = val; };
    setText("baseFee", `${FEES.BASE} EVOZX`);
    setText("featureFee", `${feature} EVOZX`);
    setText("totalFee", `${total} EVOZX`);
    setText("burnAmount", `${(total * 0.30).toFixed(2)} EVOZX`);
    setText("treasuryAmount", `${(total * 0.70).toFixed(2)} EVOZX`);
}

// Event Listeners
const inputs = ["tokenName", "symbolInput", "tokenSupply", "buyTax", "sellTax", "burnTaxShare", "website", "telegram", "twitter", "logoURI", "marketingWallet", "developmentWallet", "maxWalletPercent", "maxTxPercent"];
const checks = ["burnable", "mintable", "ownership", "maxWalletEnabled", "maxTxEnabled", "tradingControlEnabled"];

inputs.forEach(id => document.getElementById(id)?.addEventListener("input", calculate));
checks.forEach(id => document.getElementById(id)?.addEventListener("change", calculate));

window.addEventListener("DOMContentLoaded", calculate);
