import {
    ZeroAddress
} from "https://esm.sh/ethers@6";

import {
    STORAGE
} from "./config.js";

import {
    getAccount
} from "./wallet.js";

import {
    validateConfig
} from "./validation.js";

import {
    symbolExists,
    getDeploymentFee,
    getEVOZXBalance,
    getEVOZXAllowance,
    approveEVOZX,
    createToken
} from "./factory.js";

import {
    autoTopupEVOZX
} from "./exchange.js";

// =====================================================
// BUILD DEPLOYMENT
// =====================================================

export function buildDeployment(form) {

    return {

        // BASIC

        name:
            String(
                form.name ?? ""
            ).trim(),

        symbol:
            String(
                form.symbol ?? ""
            )
                .trim()
                .toUpperCase(),

        supply:
            BigInt(
                form.supply || 0
            ),

        // SYSTEM

        owner:
            ZeroAddress,

        chainId:
            0,

        launchKitVersion:
            0,

        // FEATURES

        burnable:
            Boolean(
                form.burnable
            ),

        mintable:
            Boolean(
                form.mintable
            ),

        ownershipEnabled:
            Boolean(
                form.ownershipEnabled
            ),

        // METADATA

        website:
            String(
                form.website ?? ""
            ).trim(),

        telegram:
            String(
                form.telegram ?? ""
            ).trim(),

        twitter:
            String(
                form.twitter ?? ""
            ).trim(),

        logoURI:
            String(
                form.logoURI ?? ""
            ).trim(),

        // SECURITY

        maxWalletEnabled:
            Boolean(
                form.maxWalletEnabled
            ),

        maxWalletPercent:

            form.maxWalletEnabled

                ? Number(
                    form.maxWalletPercent || 0
                )

                : 0,

        maxTxEnabled:
            Boolean(
                form.maxTxEnabled
            ),

        maxTxPercent:

            form.maxTxEnabled

                ? Number(
                    form.maxTxPercent || 0
                )

                : 0,

        // TRADING

        tradingControlEnabled:
            Boolean(
                form.tradingControlEnabled
            ),

        tradingEnabled:
            Boolean(
                form.tradingEnabled
            ),

        // TAX

        buyTaxEnabled:
            Boolean(
                form.buyTaxEnabled
            ),

        buyTax:

            form.buyTaxEnabled

                ? Number(
                    form.buyTax || 0
                )

                : 0,

        sellTaxEnabled:
            Boolean(
                form.sellTaxEnabled
            ),

        sellTax:

            form.sellTaxEnabled

                ? Number(
                    form.sellTax || 0
                )

                : 0,

        burnTaxShare:

            (
                form.buyTaxEnabled ||
                form.sellTaxEnabled
            )

                ? Number(
                    form.burnTaxShare || 0
                )

                : 0,

        marketingWallet:

            form.marketingWallet ||

            ZeroAddress,

        developmentWallet:

            form.developmentWallet ||

            ZeroAddress

    };

}

// =====================================================
// PREVIEW
// =====================================================

export async function getDeploymentPreview(form) {

    const account =
        getAccount();

    if (!account) {

        throw new Error(
            "Wallet not connected."
        );

    }

    const config =
        buildDeployment(form);

    const validationError =
        validateConfig(
            config
        );

    if (validationError) {

        throw new Error(
            validationError
        );

    }

    const fee =
        await getDeploymentFee(
            config
        );

    const balance =
        await getEVOZXBalance(
            account
        );

    const allowance =
        await getEVOZXAllowance(
            account
        );

    return {

        account,

        fee,

        balance,

        allowance,

        enoughBalance:

            balance >= fee,

        approved:

            allowance >= fee

    };

}

// =====================================================
// APPROVAL
// =====================================================

export async function approveFactory(config) {

    const account =
        getAccount();

    if (!account) {

        throw new Error(
            "Wallet not connected."
        );

    }

    const fee =
        await getDeploymentFee(
            config
        );

    const allowance =
        await getEVOZXAllowance(
            account
        );

    if (allowance >= fee) {

        return fee;

    }

    const tx =
        await approveEVOZX(
            fee
        );

    await tx.wait();

    return fee;

}
// =====================================================
// STORAGE
// =====================================================

function saveLastDeployment(deployment) {

    localStorage.setItem(

        STORAGE.lastDeployment,

        JSON.stringify(
            deployment
        )

    );

}

function saveDeploymentHistory(deployment) {

    let history = [];

    try {

        history = JSON.parse(

            localStorage.getItem(
                STORAGE.deployHistory
            ) || "[]"

        );

        if (!Array.isArray(history)) {

            history = [];

        }

    }

    catch {

        history = [];

    }

    history.unshift(
        deployment
    );

    localStorage.setItem(

        STORAGE.deployHistory,

        JSON.stringify(
            history
        )

    );

}

// =====================================================
// DEPLOY
// =====================================================

export async function deployToken(form) {

    const account =
        getAccount();

    if (!account) {

        throw new Error(
            "Wallet not connected."
        );

    }

    const config =
        buildDeployment(form);

    const validationError =
        validateConfig(
            config
        );

    if (validationError) {

        throw new Error(
            validationError
        );

    }

    const exists =
        await symbolExists(
            config.symbol
        );

    if (exists) {

        throw new Error(
            "Symbol already exists."
        );

    }

    const fee =
        await getDeploymentFee(
            config
        );

    const balance =
        await getEVOZXBalance(
            account
        );

    if (balance < fee) {

        await autoTopupEVOZX(
            fee
        );

    }

    await approveFactory(
        config
    );

    const result =
        await createToken(
            config
        );

    const deployment = {

        name:
            result.name,

        symbol:
            result.symbol,

        token:
            result.token,

        creator:
            result.creator,

        supply:
            result.supply.toString(),

        chainId:
            result.chainId.toString(),

        hash:
            result.hash,

        deployedAt:
            Date.now()

    };

    saveLastDeployment(
        deployment
    );

    saveDeploymentHistory(
        deployment
    );

    window.location.href =

        `./success.html?token=${result.token}`;

}

// =====================================================
// EXPORTS
// =====================================================

export {

    saveLastDeployment,
    saveDeploymentHistory
};
