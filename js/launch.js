import { createToken } from "./factory.js";
import { FEES } from "./config.js";

// =====================================================
// KONFIGURASI JARINGAN (Terkunci ke EVOZ 805)
// =====================================================
const NETWORK = {
    chainId: 805n,
    chainName: "EVOZ Mainnet"
};

const getVal = (id) => document.getElementById(id)?.value || "";
const isChecked = (id) => document.getElementById(id)?.checked || false;

/**
 * STRUKTUR CONFIG HARUS SAMA PERSIS DENGAN ABI
 * Urutan ini mengikuti tuple LaunchKitTypes.TokenConfig di Smart Contract
 */
export function buildTokenConfig() {
    const supplyRaw = parseFloat(getVal("tokenSupply") || 0);
    
    return {
        // 1-6
        name: getVal("tokenName"),
        symbol: getVal("symbolInput"),
        supply: BigInt(Math.floor(supplyRaw * 10**18)),
        owner: window.ethereum?.selectedAddress || "0x0000000000000000000000000000000000000000",
        chainId: NETWORK.chainId, // 805n
        launchKitVersion: 200, 
        
        // 7-9: Fitur
        burnable: isChecked("burnable"),
        mintable: isChecked("mintable"),
        ownershipEnabled: isChecked("ownership"),
        
        // 10-13: Metadata
        website: getVal("website"),
        telegram: getVal("telegram"),
        twitter: getVal("twitter"),
        logoURI: getVal("logoURI"),
        
        // 14-19: Trading & Security
        maxWalletEnabled: isChecked("maxWalletEnabled"),
        maxWalletPercent: parseInt(getVal("maxWalletPercent") || 0),
        maxTxEnabled: isChecked("maxTxEnabled"),
        maxTxPercent: parseInt(getVal("maxTxPercent") || 0),
        tradingControlEnabled: isChecked("tradingControlEnabled"),
        tradingEnabled: true, // Default to true
        
        // 20-26: Tax & Wallets
        buyTaxEnabled: parseInt(getVal("buyTax") || 0) > 0,
        buyTax: parseInt(getVal("buyTax") || 0),
        sellTaxEnabled: parseInt(getVal("sellTax") || 0) > 0,
        sellTax: parseInt(getVal("sellTax") || 0),
        burnTaxShare: parseInt(getVal("burnTaxShare") || 0),
        marketingWallet: getVal("marketingWallet") || "0x0000000000000000000000000000000000000000",
        developmentWallet: getVal("developmentWallet") || "0x0000000000000000000000000000000000000000"
    };
}

document.getElementById("deployBtn")?.addEventListener("click", async () => {
    const btn = document.getElementById("deployBtn");
    try {
        if (!window.ethereum) throw new Error("Wallet tidak terdeteksi!");
        
        const chainIdHex = await window.ethereum.request({ method: 'eth_chainId' });
        if (parseInt(chainIdHex, 16) !== Number(NETWORK.chainId)) {
            alert(`Harap pindahkan wallet Anda ke ${NETWORK.chainName} (Chain ID: 805)`);
            return;
        }

        btn.disabled = true;
        btn.textContent = "Deploying...";
        
        const config = buildTokenConfig();
        
        // Debugging log untuk memastikan urutan object benar
        console.log("Config to be sent:", config);
        
        const tx = await createToken(config);
        
        alert("Transaction submitted! Waiting for confirmation...");
        await tx.wait();
        alert("Success! Token deployed on EVOZ.");
    } catch (e) {
        console.error("Deploy Error:", e);
        alert("Deploy failed: " + (e.reason || e.message || "Unknown error"));
    } finally {
        btn.disabled = false;
        btn.textContent = "Deploy Token";
    }
});

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

const inputs = ["tokenName", "symbolInput", "tokenSupply", "buyTax", "sellTax", "burnTaxShare", "website", "telegram", "twitter", "logoURI", "marketingWallet", "developmentWallet", "maxWalletPercent", "maxTxPercent"];
const checks = ["burnable", "mintable", "ownership", "maxWalletEnabled", "maxTxEnabled", "tradingControlEnabled"];

inputs.forEach(id => document.getElementById(id)?.addEventListener("input", calculate));
checks.forEach(id => document.getElementById(id)?.addEventListener("change", calculate));

window.addEventListener("DOMContentLoaded", calculate);
