// ======================================================
// EVOZX LaunchFuture
// deploy.js
// ======================================================

import { ethers } from "https://cdn.jsdelivr.net/npm/ethers@6.15.0/+esm";

import {

    getAccount

} from "./wallet.js";

import {

    getDeploymentFee,
    getEVOZXBalance,
    getEVOZXAllowance,
    approveEVOZX,
    createToken

} from "./factory.js";

import {

    autoTopupEVOZX

} from "./exchange.js";


// ======================================================
// TOKEN DECIMALS
// ======================================================

const DECIMALS = 18;


// ======================================================
// BALANCE
// ======================================================

export async function balanceOf() {

    return await getEVOZXBalance();

}


// ======================================================
// ALLOWANCE
// ======================================================

export async function allowance() {

    return await getEVOZXAllowance();

}


// ======================================================
// APPROVE
// ======================================================

export async function approve(amount) {

    if (

        amount <= 0n

    ) {

        throw new Error(

            "Invalid approval amount."

        );

    }

    return await approveEVOZX(

        amount

    );

}


// ======================================================
// GET BALANCE (Formatted)
// ======================================================

export async function getBalance() {

    const raw =

        await balanceOf();

    return Number(

        ethers.formatUnits(

            raw,
            DECIMALS

        )

    );

}


// ======================================================
// APPROVE FACTORY
// ======================================================

export async function approveFactory(

    fee

) {

    const currentAllowance =

        await allowance();

    if (

        currentAllowance >= fee

    ) {

        return;

    }

    await approve(

        fee

    );

}

// ======================================================
// INPUT VALIDATION
// ======================================================

export function validateInput(formData) {

    if (!formData) {
        throw new Error(
            "Invalid form."
        );
    }

    // ==================================================
    // NAME
    // ==================================================

    formData.name =
        formData.name.trim();

    if (
        formData.name.length < 2
    ) {
        throw new Error(
            "Token name must contain at least 2 characters."
        );
    }

    // ==================================================
    // SYMBOL
    // ==================================================

    formData.symbol =
        formData.symbol
            .trim()
            .toUpperCase();

    if (
        formData.symbol.length < 2
    ) {
        throw new Error(
            "Token symbol must contain at least 2 characters."
        );
    }

    if (
        formData.symbol.length > 12
    ) {
        throw new Error(
            "Maximum symbol length is 12 characters."
        );
    }

    // ==================================================
    // SUPPLY
    // ==================================================

    formData.supply =
        Number(formData.supply);

    if (
        Number.isNaN(
            formData.supply
        )
    ) {
        throw new Error(
            "Invalid supply."
        );
    }

    if (
        formData.supply <= 0
    ) {
        throw new Error(
            "Supply must be greater than zero."
        );
    }

    if (
        formData.supply >
        1_000_000_000_000
    ) {
        throw new Error(
            "Maximum supply is 1 trillion."
        );
    }

    // ==================================================
    // BUY TAX
    // ==================================================

    formData.buyTax =
        Number(
            formData.buyTax
        );

    if (
        formData.buyTaxEnabled
    ) {

        if (
            formData.buyTax < 0
            ||
            formData.buyTax > 10
        ) {
            throw new Error(
                "Buy tax must be between 0 and 10%."
            );
        }

    }

    // ==================================================
    // SELL TAX
    // ==================================================

    formData.sellTax =
        Number(
            formData.sellTax
        );

    if (
        formData.sellTaxEnabled
    ) {

        if (
            formData.sellTax < 0
            ||
            formData.sellTax > 10
        ) {
            throw new Error(
                "Sell tax must be between 0 and 10%."
            );
        }

    }

    // ==================================================
    // BURN SHARE
    // ==================================================

    formData.burnTaxShare =
        Number(
            formData.burnTaxShare
        );

    if (
        formData.burnTaxShare < 0
        ||
        formData.burnTaxShare > 100
    ) {
        throw new Error(
            "Burn share must be between 0 and 100%."
        );
    }

    // ==================================================
    // TAX RECEIVER
    // ==================================================

    if (

        formData.buyTaxEnabled
        ||
        formData.sellTaxEnabled

    ) {

        const hasBurn =

            formData.burnTaxShare > 0;

        const hasMarketing =

            formData.marketingWallet &&
            ethers.isAddress(
                formData.marketingWallet
            );

        const hasDevelopment =

            formData.developmentWallet &&
            ethers.isAddress(
                formData.developmentWallet
            );

        if (

            !hasBurn &&
            !hasMarketing &&
            !hasDevelopment

        ) {

            throw new Error(

                "Tax requires burn share or at least one wallet."

            );

        }

    }

    // ==================================================
    // MARKETING
    // ==================================================

    if (

        formData.marketingWallet &&
        !ethers.isAddress(
            formData.marketingWallet
        )

    ) {

        throw new Error(

            "Invalid marketing wallet."

        );

    }

    // ==================================================
    // DEVELOPMENT
    // ==================================================

    if (

        formData.developmentWallet &&
        !ethers.isAddress(
            formData.developmentWallet
        )

    ) {

        throw new Error(

            "Invalid development wallet."

        );

    }

    // ==================================================
    // MAX WALLET
    // ==================================================

    formData.maxWalletPercent =
        Number(
            formData.maxWalletPercent
        );

    if (

        formData.maxWalletEnabled

    ) {

        if (

            formData.maxWalletPercent <= 0
            ||
            formData.maxWalletPercent > 100

        ) {

            throw new Error(

                "Max wallet must be between 1 and 100%."

            );

        }

    }

    // ==================================================
    // MAX TX
    // ==================================================

    formData.maxTxPercent =
        Number(
            formData.maxTxPercent
        );

    if (

        formData.maxTxEnabled

    ) {

        if (

            formData.maxTxPercent <= 0
            ||
            formData.maxTxPercent > 100

        ) {

            throw new Error(

                "Max transaction must be between 1 and 100%."

            );

        }

    }

    // ==================================================
    // URL LENGTH
    // ==================================================

    if (
        formData.website.length > 300
    ) {
        throw new Error(
            "Website URL is too long."
        );
    }

    if (
        formData.telegram.length > 300
    ) {
        throw new Error(
            "Telegram URL is too long."
        );
    }

    if (
        formData.twitter.length > 300
    ) {
        throw new Error(
            "Twitter URL is too long."
        );
    }

    if (
        formData.logoURI.length > 500
    ) {
        throw new Error(
            "Logo URL is too long."
        );
    }

    return formData;

        }

// ======================================================
// BUILD TOKEN CONFIG
// ======================================================

export function buildConfig(formData) {

    return {

        // ==================================================
        // BASIC
        // ==================================================

        name:

            formData.name.trim(),

        symbol:

            formData.symbol
                .trim()
                .toUpperCase(),

        supply:

            BigInt(
                formData.supply
            ),

        owner:

            ethers.ZeroAddress,

        // ==================================================
        // DEPLOYMENT INFO
        // ==================================================

        chainId:

            0,

        launchKitVersion:

            0,

        // ==================================================
        // CORE FEATURES
        // ==================================================

        burnable:

            !!formData.burnable,

        mintable:

            !!formData.mintable,

        ownershipEnabled:

            !!formData.ownershipEnabled,

        // ==================================================
        // METADATA
        // ==================================================

        website:

            formData.website
                ?.trim() ?? "",

        telegram:

            formData.telegram
                ?.trim() ?? "",

        twitter:

            formData.twitter
                ?.trim() ?? "",

        logoURI:

            formData.logoURI
                ?.trim() ?? "",

        // ==================================================
        // SECURITY
        // ==================================================

        maxWalletEnabled:

            !!formData.maxWalletEnabled,

        maxWalletPercent:

            Number(
                formData.maxWalletEnabled
                    ? formData.maxWalletPercent
                    : 0
            ),

        maxTxEnabled:

            !!formData.maxTxEnabled,

        maxTxPercent:

            Number(
                formData.maxTxEnabled
                    ? formData.maxTxPercent
                    : 0
            ),

        tradingControlEnabled:

            !!formData.tradingControlEnabled,

        tradingEnabled:

            !!formData.tradingEnabled,

        // ==================================================
        // TOKENOMICS
        // ==================================================

        buyTaxEnabled:

            !!formData.buyTaxEnabled,

        buyTax:

            Number(
                formData.buyTaxEnabled
                    ? formData.buyTax
                    : 0
            ),

        sellTaxEnabled:

            !!formData.sellTaxEnabled,

        sellTax:

            Number(
                formData.sellTaxEnabled
                    ? formData.sellTax
                    : 0
            ),

        burnTaxShare:

            Number(
                (
                    formData.buyTaxEnabled ||
                    formData.sellTaxEnabled
                )
                    ? formData.burnTaxShare
                    : 0
            ),

        marketingWallet:

            formData.marketingWallet
            || ethers.ZeroAddress,

        developmentWallet:

            formData.developmentWallet
            || ethers.ZeroAddress

    };

        }

// ======================================================
// FACTORY APPROVAL
// ======================================================

export async function approveFactory(config) {

    // ------------------------------------------
    // Calculate deployment fee
    // ------------------------------------------

    const fee = await getDeploymentFee(
        config
    );

    // ------------------------------------------
    // Current allowance
    // ------------------------------------------

    const currentAllowance =
        await getEVOZXAllowance();

    if (
        currentAllowance >= fee
    ) {

        return fee;

    }

    // ------------------------------------------
    // Send approval transaction
    // ------------------------------------------

    const approveTx =
        await approveEVOZX(
            fee
        );

    await approveTx.wait();

    // ------------------------------------------
    // Verify approval
    // ------------------------------------------

    const newAllowance =
        await getEVOZXAllowance();

    if (
        newAllowance < fee
    ) {

        throw new Error(
            "Factory approval failed."
        );

    }

    return fee;

}

// ======================================================
// DEPLOY TOKEN
// ======================================================

export async function deployToken(formData) {

    // ------------------------------------------
    // Wallet
    // ------------------------------------------

    const account =
        getAccount();

    if (!account) {

        throw new Error(
            "Wallet not connected."
        );

    }

    // ------------------------------------------
    // Validation
    // ------------------------------------------

    validateInput(
        formData
    );

    // ------------------------------------------
    // Config
    // ------------------------------------------

    const config =
        buildConfig(
            formData
        );

    // ------------------------------------------
    // Symbol
    // ------------------------------------------

    const exists =
        await symbolExists(
            config.symbol
        );

    if (exists) {

        throw new Error(
            "Symbol already exists."
        );

    }

    // ------------------------------------------
    // Fee
    // ------------------------------------------

    const fee =
        await getDeploymentFee(
            config
        );

    // ------------------------------------------
    // Balance
    // ------------------------------------------

    const balance =
        await getEVOZXBalance(
            account
        );

    // ------------------------------------------
    // Auto Buy
    // ------------------------------------------

    if (

        balance < fee

    ) {

        await autoTopupEVOZX(
            fee
        );

    }

    // ------------------------------------------
    // Approval
    // ------------------------------------------

    await approveFactory(
        config
    );

    // ------------------------------------------
    // Deploy
    // ------------------------------------------

    const result =
        await createToken(
            config
        );

    // ------------------------------------------
    // Save Result
    // ------------------------------------------

    localStorage.setItem(

        "launchfuture:lastDeployment",

        JSON.stringify({

            hash:
                result.hash,

            token:
                result.token,

            creator:
                result.creator,

            name:
                result.name,

            symbol:
                result.symbol,

            supply:
                result.supply.toString(),

            chainId:
                result.chainId.toString(),

            deployedAt:
                Date.now()

        })

    );

    // ------------------------------------------
    // Dashboard History
    // ------------------------------------------

    const history =

        JSON.parse(

            localStorage.getItem(

                "launchfuture:history"

            ) ?? "[]"

        );

    history.unshift({

        hash:
            result.hash,

        token:
            result.token,

        creator:
            result.creator,

        name:
            result.name,

        symbol:
            result.symbol,

        supply:
            result.supply.toString(),

        chainId:
            result.chainId.toString(),

        deployedAt:
            Date.now()

    });

    localStorage.setItem(

        "launchfuture:history",

        JSON.stringify(history)

    );

    // ------------------------------------------
    // Redirect
    // ------------------------------------------

    window.location.href =
        `success.html?token=${result.token}`;

}
