import { symbolExists, createToken } from "./factory.js";
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

// =====================================================
// CONFIG BUILDER (REVISI BIGINT & STRUKTUR)
// =====================================================
export function buildTokenConfig() {
    // Fungsi pembantu untuk konversi ke BigInt
    // Asumsi 18 desimal standar ERC20
    const toBigInt = (val) => {
        try {
            return BigInt(Math.floor(parseFloat(val || 0) * 10**18));
        } catch { return 0n; }
    };

    return {
        name: tokenName.value || "Untitled",
        symbol: tokenSymbol.value || "TOKEN",
        supply: toBigInt(tokenSupply.value), // Konversi ke Wei
        
        // Flags
        burnable: burnable?.checked || false,
        mintable: mintable?.checked || false,
        ownershipEnabled: ownership?.checked || false,
        maxWalletEnabled: maxWallet?.checked || false,
        maxTxEnabled: maxTx?.checked || false,
        tradingControlEnabled: tradingControl?.checked || false,
        
        // Values (Convert ke Number agar tidak string)
        maxWalletPercent: maxWallet?.checked ? parseInt(document.getElementById("maxWalletInput")?.value || 0) : 0,
        maxTxPercent: maxTx?.checked ? parseInt(document.getElementById("maxTxInput")?.value || 0) : 0,
        buyTax: parseInt(buyTax?.value || 0),
        sellTax: parseInt(sellTax?.value || 0),
        
        // Socials
        website: website?.value || "",
        telegram: telegram?.value || "",
        twitter: twitter?.value || "",
        logoURI: logoURI?.value || "",

        // Tambahan Default (Sering dibutuhkan Factory Contract)
        marketingWallet: "0x0000000000000000000000000000000000000000",
        developmentWallet: "0x0000000000000000000000000000000000000000"
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
        
        // Debugging: Cek data di console sebelum kirim
        console.log("Data Config yang dikirim:", config);
        
        const tx = await createToken(config);
        
        alert("Transaction submitted! Please wait for confirmation.");
        await tx.wait();
        alert("Success! Token deployed.");
        
        deployBtn.textContent = "Deploy Token";
        deployBtn.disabled = false;
    } catch (e) {
        console.error("Deploy Error:", e);
        // Menampilkan pesan error yang lebih jelas dari MetaMask/Contract
        const msg = e.reason || e.data?.message || e.message || "Unknown error";
        alert("Deploy failed: " + msg);
        deployBtn.disabled = false;
        deployBtn.textContent = "Deploy Token";
    }
});

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
    
    // Update Stats
    const total = FEES.BASE + feature;
    const setText = (id, val) => { const el = document.getElementById(id); if(el) el.textContent = val; };
    
    setText("baseFee", `${FEES.BASE} EVOZX`);
    setText("featureFee", `${feature} EVOZX`);
    setText("totalFee", `${total} EVOZX`);
    setText("burnAmount", `${(total * 0.30).toFixed(2)} EVOZX`);
    setText("treasuryAmount", `${(total * 0.70).toFixed(2)} EVOZX`);
}

// Listeners
[burnable, mintable, ownership, maxWallet, maxTx, tradingControl].forEach(el => el?.addEventListener("change", calculate));
[tokenName, tokenSymbol, tokenSupply, buyTax, sellTax, website, telegram, twitter, logoURI].forEach(el => el?.addEventListener("input", calculate));

window.addEventListener("DOMContentLoaded", calculate);
        
