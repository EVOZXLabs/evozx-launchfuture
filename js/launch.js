import { createToken } from "./factory.js";
import { FEES } from "./config.js";

// =====================================================
// UTILS - Menggunakan Optional Chaining (?.) untuk mencegah error null
// =====================================================
const getVal = (id) => document.getElementById(id)?.value || "";
const isChecked = (id) => document.getElementById(id)?.checked || false;

// =====================================================
// CONFIG BUILDER
// =====================================================
export function buildTokenConfig() {
    const supplyRaw = parseFloat(getVal("tokenSupply") || 0);
    
    // Perbaikan: Menambahkan chainId dan memastikan akses data aman
    return {
        name: getVal("tokenName"),
        symbol: getVal("symbolInput"),
        supply: BigInt(Math.floor(supplyRaw * 10**18)), 
        owner: window.ethereum?.selectedAddress || "0x0000000000000000000000000000000000000000",
        chainId: BigInt(getVal("chainId") || 56), // Menambahkan Chain ID
        launchKitVersion: 200, 
        
        ownershipEnabled: isChecked("ownership"),
        burnable: isChecked("burnable"),
        mintable: isChecked("mintable"),
        
        website: getVal("website"),
        telegram: getVal("telegram"),
        twitter: getVal("twitter"),
        logoURI: getVal("logoURI"),
        
        maxWalletEnabled: isChecked("maxWalletEnabled"),
        maxWalletPercent: parseInt(getVal("maxWalletPercent") || 0),
        maxTxEnabled: isChecked("maxTxEnabled"),
        maxTxPercent: parseInt(getVal("maxTxPercent") || 0),
        tradingControlEnabled: isChecked("tradingControlEnabled"),
        tradingEnabled: true,
        
        buyTaxEnabled: parseInt(getVal("buyTax") || 0) > 0,
        buyTax: parseInt(getVal("buyTax") || 0),
        sellTaxEnabled: parseInt(getVal("sellTax") || 0) > 0,
        sellTax: parseInt(getVal("sellTax") || 0),
        burnTaxShare: parseInt(getVal("burnTaxShare") || 0),
        marketingWallet: getVal("marketingWallet") || "0x0000000000000000000000000000000000000000",
        developmentWallet: getVal("developmentWallet") || "0x0000000000000000000000000000000000000000"
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
        console.log("Mengirim Config:", config);
        
        const tx = await createToken(config);
        
        alert("Transaction submitted! Waiting for confirmation...");
        await tx.wait();
        alert("Success! Token deployed.");
    } catch (e) {
        console.error("Deploy Error:", e);
        alert("Deploy failed: " + (e.reason || e.message || "Unknown error"));
    } finally {
        btn.disabled = false;
        btn.textContent = "Deploy Token";
    }
});

// =====================================================
// FEE ENGINE
// =====================================================
function calculate() {
    let feature = 0;
    if (isChecked("burnable")) feature += FEES.BURNABLE;
    if (isChecked("mintable")) feature += FEES.MINTABLE;
    if (isChecked("ownership")) feature += FEES.OWNERSHIP;
    if (isChecked("maxWalletEnabled")) feature += FEES.MAX_WALLET;
    if (isChecked("maxTxEnabled")) feature += FEES.MAX_TX;
    if (isChecked("tradingControlEnabled")) feature += FEES.TRADING_CONTROL;
    
    if (parseInt(getVal("buyTax") || 0) > 0 || parseInt(getVal("sellTax") || 0) > 0) feature += FEES.TAX;
    
    const total = FEES.BASE + feature;
    
    const setText = (id, val) => { const el = document.getElementById(id); if(el) el.textContent = val; };
    setText("baseFee", `${FEES.BASE} EVOZX`);
    setText("featureFee", `${feature} EVOZX`);
    setText("totalFee", `${total} EVOZX`);
    setText("burnAmount", `${(total * 0.30).toFixed(2)} EVOZX`);
    setText("treasuryAmount", `${(total * 0.70).toFixed(2)} EVOZX`);
}

// Event Listeners (Safe Registration)
const inputs = ["tokenName", "symbolInput", "tokenSupply", "chainId", "buyTax", "sellTax", "burnTaxShare", "website", "telegram", "twitter", "logoURI", "marketingWallet", "developmentWallet", "maxWalletPercent", "maxTxPercent"];
const checks = ["burnable", "mintable", "ownership", "maxWalletEnabled", "maxTxEnabled", "tradingControlEnabled"];

inputs.forEach(id => document.getElementById(id)?.addEventListener("input", calculate));
checks.forEach(id => document.getElementById(id)?.addEventListener("change", calculate));

window.addEventListener("DOMContentLoaded", calculate);
    
