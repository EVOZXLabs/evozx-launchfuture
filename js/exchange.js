import {
    Contract,
    JsonRpcProvider,
    parseEther
} from "https://esm.sh/ethers@6";

import {
    CONTRACTS,
    NETWORK
} from "./config.js";

import {
    getSigner
} from "./wallet.js";

let exchangeAbi = null;

let provider = null;

let exchangeRead = null;

let exchangeWrite = null;

// =====================================================
// ABI
// =====================================================

async function loadAbi(path) {

    const response =
        await fetch(path);

    if (!response.ok) {

        throw new Error(
            `Unable to load ABI: ${path}`
        );

    }

    return await response.json();

}

export async function loadExchangeAbi() {

    if (exchangeAbi) {

        return exchangeAbi;

    }

    exchangeAbi =
        await loadAbi(
            "./abi/exchange.json"
        );

    return exchangeAbi;

}

// =====================================================
// PROVIDER
// =====================================================

export function getReadProvider() {

    if (provider) {

        return provider;

    }

    provider =
        new JsonRpcProvider(
            NETWORK.rpc
        );

    return provider;

}

// =====================================================
// CONTRACT
// =====================================================

export async function getExchangeRead() {

    if (exchangeRead) {

        return exchangeRead;

    }

    const abi =
        await loadExchangeAbi();

    exchangeRead =
        new Contract(

            CONTRACTS.exchange,

            abi,

            getReadProvider()

        );

    return exchangeRead;

}

export async function getExchangeWrite() {

    const signer =
        getSigner();

    if (!signer) {

        throw new Error(
            "Wallet not connected."
        );

    }

    const abi =
        await loadExchangeAbi();

    exchangeWrite =
        new Contract(

            CONTRACTS.exchange,

            abi,

            signer

        );

    return exchangeWrite;

}

// =====================================================
// INFO
// =====================================================

export async function getRate() {

    const exchange =
        await getExchangeRead();

    return await exchange.rate();

}

export async function getStock() {

    const exchange =
        await getExchangeRead();

    return await exchange.getAvailableStock();

}

export async function isPaused() {

    const exchange =
        await getExchangeRead();

    return await exchange.paused();

}

// =====================================================
// CALCULATION
// =====================================================

export async function calculateEVOZNeeded(
    missingEVOZX
) {

    if (

        missingEVOZX <= 0n

    ) {

        return 0n;

    }

    const rate =
        await getRate();

    return (

        missingEVOZX *
        rate

    );

}

export async function hasEnoughStock(
    amount
) {

    const stock =
        await getStock();

    return stock >= amount;

        }

// ======================================================
// AUTO TOPUP
// ======================================================

export async function autoTopupEVOZX(requiredFee) {

    const currentBalance =
        await getEVOZXBalance();

    if (
        currentBalance >= requiredFee
    ) {
        return {
            purchased: false,
            amount: 0n
        };
    }

    const missing =
        requiredFee -
        currentBalance;

    const nativeNeeded =
        await calculateEVOZNeeded(
            missing
        );

    await buyEVOZX(
        nativeNeeded
    );

    const updatedBalance =
        await getEVOZXBalance();

    if (
        updatedBalance < requiredFee
    ) {
        throw new Error(
            "Automatic EVOZX purchase failed."
        );
    }

    return {
        purchased: true,
        amount: missing
    };
        }

// ======================================================
// EXCHANGE STATUS
// ======================================================

export async function getExchangeStatus() {

    const exchange =
        await getExchangeRead();

    return {

        paused:
            await exchange.paused(),

        rate:
            await exchange.rate(),

        stock:
            await exchange.getAvailableStock()

    };
}

// ======================================================
// DEPLOY ESTIMATION
// ======================================================

export async function estimatePurchase(requiredFee) {

    const balance =
        await getEVOZXBalance();

    if (
        balance >= requiredFee
    ) {

        return {

            needPurchase: false,

            missingEVOZX: 0n,

            requiredEVOZ: 0n

        };

    }

    const missing =
        requiredFee -
        balance;

    const evoz =
        await calculateEVOZNeeded(
            missing
        );

    return {

        needPurchase: true,

        missingEVOZX: missing,

        requiredEVOZ: evoz

    };
}
