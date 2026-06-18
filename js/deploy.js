import {
    ZeroAddress
} from "https://esm.sh/ethers@6";

import {
    NETWORK,
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
    createToken,
    getLaunchKitVersion
} from "./factory.js";

import {
    autoTopupEVOZX
} from "./exchange.js";

// =====================================================
// HELPERS
// =====================================================

function normalizeString(
    value
) {

    return String(
        value ?? ""
    ).trim();

}

function normalizeNumber(
    value
) {

    const number =
        Number(value);

    return Number.isFinite(
        number
    )
        ? number
        : 0;

}

// =====================================================
// BUILD CONFIG
// =====================================================

export async function buildDeployment(
    form
) {

    const account =
        getAccount();

    if (!account) {

        throw new Error(
            "Wallet not connected."
        );

    }

    const launchKitVersion =

        await getLaunchKitVersion();

    return {

        // BASIC

        name:

            normalizeString(
                form.name
            ),

        symbol:

            normalizeString(
                form.symbol
            ).toUpperCase(),

        supply:

            BigInt(
                form.supply || 0
            ),

        // SYSTEM

        owner:
            account,

        chainId:
            NETWORK.chainId,

        launchKitVersion:
            Number(
                launchKitVersion
            ),

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

            normalizeString(
                form.website
            ),

        telegram:

            normalizeString(
                form.telegram
            ),

        twitter:

            normalizeString(
                form.twitter
            ),

        logoURI:

            normalizeString(
                form.logoURI
            ),

        // SECURITY

        maxWalletEnabled:

            Boolean(
                form.maxWalletEnabled
            ),

        maxWalletPercent:

            form.maxWalletEnabled

                ? normalizeNumber(
                    form.maxWalletPercent
                )

                : 0,

        maxTxEnabled:

            Boolean(
                form.maxTxEnabled
            ),

        maxTxPercent:

            form.maxTxEnabled

                ? normalizeNumber(
                    form.maxTxPercent
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

                ? normalizeNumber(
                    form.buyTax
                )

                : 0,

        sellTaxEnabled:

            Boolean(
                form.sellTaxEnabled
            ),

        sellTax:

            form.sellTaxEnabled

                ? normalizeNumber(
                    form.sellTax
                )

                : 0,

        burnTaxShare:

            (
                form.buyTaxEnabled ||
                form.sellTaxEnabled
            )

                ? normalizeNumber(
                    form.burnTaxShare
                )

                : 0,

        marketingWallet:

            normalizeString(
                form.marketingWallet
            ) ||

            ZeroAddress,

        developmentWallet:

            normalizeString(
                form.developmentWallet
            ) ||

            ZeroAddress

    };

}

// =====================================================
// PREVIEW
// =====================================================

export async function getDeploymentPreview(
    form
) {

    const account =
        getAccount();

    if (!account) {

        throw new Error(
            "Wallet not connected."
        );

    }

    const config =

        await buildDeployment(
            form
        );

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

        config,

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

export async function approveFactory(
    config
) {

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

    await approveEVOZX(
        fee
    );

    return fee;

}

// =====================================================
// STORAGE
// =====================================================

export function saveLastDeployment(
    deployment
) {

    localStorage.setItem(

        STORAGE.lastToken,

        JSON.stringify(
            deployment
        )

    );

}

export function saveDeploymentHistory(
    deployment
) {

    let history = [];

    try {

        history = JSON.parse(

            localStorage.getItem(

                STORAGE.deployHistory

            ) || "[]"

        );

        if (
            !Array.isArray(
                history
            )
        ) {

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

export async function deployToken(
    form
) {

    const account =
        getAccount();

    if (!account) {

        throw new Error(
            "Wallet not connected."
        );

    }

    const config =

        await buildDeployment(
            form
        );

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
// UTILITIES
// =====================================================

export async function canDeploy(
    form
) {

    try {

        const preview =

            await getDeploymentPreview(
                form
            );

        return (

            preview.enoughBalance

        );

    }

    catch {

        return false;

    }

}

export async function estimateDeployment(
    form
) {

    const preview =

        await getDeploymentPreview(
            form
        );

    return {

        fee:
            preview.fee,

        balance:
            preview.balance,

        allowance:
            preview.allowance,

        approved:
            preview.approved,

        enoughBalance:
            preview.enoughBalance

    };

}
