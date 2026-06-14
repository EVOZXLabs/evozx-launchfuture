import { Contract, formatEther } from "https://esm.sh/ethers@6";
import { getFactoryForWrite, getDeploymentFee } from "./factory.js";
import { autoTopupEVOZX } from "./exchange.js";
import { CONTRACTS } from "./config.js";
import { getSigner } from "./wallet.js";

// =====================================================
// ELEMENTS
// =====================================================
const deployBtn = document.getElementById("deployBtn");

// Helper untuk mengambil value input dengan aman
const getVal = (id) => document.getElementById(id)?.value || "";
const getChecked = (id) => document.getElementById(id)?.checked || false;

// =====================================================
// STATE & ABI
// =====================================================
let isDeploying = false;
const EVOZX_ABI = [
    "function balanceOf(address) view returns (uint256)",
    "function allowance(address,address) view returns (uint256)",
    "function approve(address,uint256) returns (bool)"
];

// =====================================================
// VALIDATION & CONFIG
// =====================================================
function validateInput() {
    if (!getVal("tokenName")) return "Token name required";
    if (!getVal("symbolInput")) return "Token symbol required";
    if (Number(getVal("tokenSupply")) <= 0) return "Invalid supply";
    return null;
}

async function buildConfig() {
    const signer = getSigner();
    const owner = await signer.getAddress();
    const network = await signer.provider.getNetwork();

    return {
        name: getVal("tokenName"),
        symbol: getVal("symbolInput"),
        supply: BigInt(getVal("tokenSupply") || 0),
        owner: owner,
        chainId: BigInt(network.chainId),
        launchKitVersion: 200,
        
        // Features
        burnable: getChecked("burnable"),
        mintable: getChecked("mintable"),
        ownershipEnabled: getChecked("ownership"),
        
        // Trading & Security
        tradingControlEnabled: getChecked("tradingControlEnabled"),
        tradingEnabled: getChecked("tradingEnabled"),
        maxWalletEnabled: getChecked("maxWalletEnabled"),
        maxWalletPercent: Number(getVal("maxWalletPercent") || 0),
        maxTxPercent: Number(getVal("maxTxPercent") || 0),
        
        // Tokenomics
        buyTaxEnabled: Number(getVal("buyTax")) > 0,
        buyTax: Number(getVal("buyTax") || 0),
        sellTaxEnabled: Number(getVal("sellTax")) > 0,
        sellTax: Number(getVal("sellTax") || 0),
        burnTaxShare: Number(getVal("burnTaxShare") || 0),
        
        // Wallets & Metadata
        marketingWallet: getVal("marketingWallet") || owner,
        developmentWallet: getVal("developmentWallet") || owner,
        website: getVal("website"),
        telegram: getVal("telegram"),
        twitter: getVal("twitter"),
        logoURI: getVal("logoURI")
    };
}

// =====================================================
// ACTIONS
// =====================================================

async function getBalance() {
    const signer = getSigner();
    const owner = await signer.getAddress();
    const token = new Contract(CONTRACTS.EVOZX, EVOZX_ABI, signer);
    return await token.balanceOf(owner);
}

async function approveFactory(amount) {
    const signer = getSigner();
    const token = new Contract(CONTRACTS.EVOZX, EVOZX_ABI, signer);
    const allowance = await token.allowance(await signer.getAddress(), CONTRACTS.FACTORY);
    
    if (allowance >= amount) return;
    
    const tx = await token.approve(CONTRACTS.FACTORY, amount);
    await tx.wait();
}

async function deployToken() {
    if (isDeploying) return;

    try {
        const validation = validateInput();
        if (validation) {
            alert(validation);
            return;
        }

        isDeploying = true;
        deployBtn.disabled = true;
        deployBtn.textContent = "Preparing...";

        const factory = await getFactoryForWrite();
        if (!factory) {
            alert("Wallet not connected");
            isDeploying = false;
            deployBtn.disabled = false;
            return;
        }

        const config = await buildConfig();

        // Fee logic
        deployBtn.textContent = "Calculating Fee...";
        const deployFee = await getDeploymentFee(config);

        // Balance Check
        deployBtn.textContent = "Checking Balance...";
        const balance = await getBalance();
        if (balance < deployFee) {
            const missing = Number(formatEther(deployFee - balance));
            await autoTopupEVOZX(missing);
        }

        // Approve
        deployBtn.textContent = "Approving EVOZX...";
        await approveFactory(deployFee);

        // Create Token
        deployBtn.textContent = "Deploying...";
        const tx = await factory.createToken(config);
        const receipt = await tx.wait();

        // Success logic
        let tokenAddress = receipt.logs.find(log => log.fragment?.name === "TokenCreated")?.args[0];

        const historyItem = {
            token: tokenAddress,
            name: config.name,
            symbol: config.symbol,
            txHash: tx.hash,
            time: Date.now()
        };

        const history = JSON.parse(localStorage.getItem("myTokens") || "[]");
        history.push(historyItem);
        localStorage.setItem("myTokens", JSON.stringify(history));
        localStorage.setItem("lastDeployedToken", JSON.stringify(historyItem));

        window.location.href = "./success.html";

    } catch (error) {
        console.error("DEPLOY ERROR:", error);
        alert(error?.reason || error?.message || "Deploy failed");
    } finally {
        isDeploying = false;
        deployBtn.disabled = false;
        deployBtn.textContent = "Deploy Token";
    }
}

// =====================================================
// INIT
// =====================================================
deployBtn?.addEventListener("click", deployToken);
      
