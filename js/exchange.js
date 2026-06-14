import { BrowserProvider, Contract, parseEther, formatEther } from "https://esm.sh/ethers@6";
import { CONTRACTS } from "./config.js";
import { getSigner } from "./wallet.js";

// =====================================================
// ABI CACHE & LOADER
// =====================================================
let exchangeAbi = null;

async function getExchangeContract(write = false) {
    if (!exchangeAbi) {
        const res = await fetch("./abi/exchange.json");
        exchangeAbi = await res.json();
    }

    if (write) {
        const signer = getSigner();
        if (!signer) throw new Error("Wallet not connected");
        return new Contract(CONTRACTS.EXCHANGE, exchangeAbi, signer);
    }

    if (!window.ethereum) throw new Error("Wallet not found");
    return new Contract(CONTRACTS.EXCHANGE, exchangeAbi, new BrowserProvider(window.ethereum));
}

// =====================================================
// ACTIONS
// =====================================================

export async function getRate() {
    try {
        return Number((await (await getExchangeContract()).rate()));
    } catch {
        return 0;
    }
}

export async function getStock() {
    try {
        const stock = await (await getExchangeContract()).getAvailableStock();
        return Number(formatEther(stock));
    } catch {
        return 0;
    }
}

export async function calculateEVOZNeeded(missingEVOZX) {
    const rate = await getRate();
    if (!rate) throw new Error("Invalid exchange rate");
    return Number(missingEVOZX) / rate;
}

export async function buyEVOZX(evozAmount) {
    const contract = await getExchangeContract(true);
    const tx = await contract.buyEVOZX({ value: parseEther(String(evozAmount)) });
    await tx.wait();
    return tx.hash;
}

// =====================================================
// AUTO TOPUP
// =====================================================

export async function autoTopupEVOZX(missingEVOZX) {
    const missing = Number(missingEVOZX);
    if (missing <= 0) return { success: true, purchased: false };

    const stock = await getStock();
    if (stock < missing) throw new Error("Exchange stock insufficient");

    const evozNeeded = await calculateEVOZNeeded(missing);
    const txHash = await buyEVOZX(evozNeeded);

    return {
        success: true,
        purchased: true,
        missing,
        evozNeeded,
        txHash
    };
}
