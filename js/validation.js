import {
    isAddress
} from "https://esm.sh/ethers@6";

import {
    symbolExists
} from "./factory.js";

// =====================================================
// CONSTANTS
// =====================================================

export const LIMITS = {

    MIN_NAME_LENGTH: 2,

    MIN_SYMBOL_LENGTH: 2,

    MAX_SYMBOL_LENGTH: 12,

    MAX_SUPPLY:
        1_000_000_000_000,

    MIN_SUPPLY: 1,

    MAX_TAX: 10,

    MIN_PERCENT: 1,

    MAX_PERCENT: 100

};

// =====================================================
// TEXT
// =====================================================

function text(value) {

    return String(
        value ?? ""
    ).trim();

}

// =====================================================
// REQUIRED
// =====================================================

export function required(value) {

    return text(value).length > 0;

}

// =====================================================
// NAME
// =====================================================

export function validateName(name) {

    name = text(name);

    if (!name) {

        return "Token name is required.";

    }

    if (

        name.length <
        LIMITS.MIN_NAME_LENGTH

    ) {

        return "Token name must contain at least 2 characters.";

    }

    return "";

}

// =====================================================
// SYMBOL
// =====================================================

export function validateSymbol(symbol) {

    symbol = text(symbol);

    if (!symbol) {

        return "Token symbol is required.";

    }

    if (

        symbol.length <
        LIMITS.MIN_SYMBOL_LENGTH

    ) {

        return "Token symbol must contain at least 2 characters.";

    }

    if (

        symbol.length >
        LIMITS.MAX_SYMBOL_LENGTH

    ) {

        return "Maximum symbol length is 12.";

    }

    return "";

}

export async function checkSymbol(symbol) {

    const error =
        validateSymbol(symbol);

    if (error) {

        return {

            valid: false,

            exists: false,

            message: error

        };

    }

    const exists =
        await symbolExists(
            text(symbol)
        );

    return {

        valid: !exists,

        exists,

        message:
            exists
                ? "Symbol already exists."
                : ""

    };

}

// =====================================================
// SUPPLY
// =====================================================

export function validateSupply(supply) {

    const value =
        Number(supply);

    if (

        !Number.isFinite(value)

    ) {

        return "Invalid supply.";

    }

    if (

        value <
        LIMITS.MIN_SUPPLY

    ) {

        return "Supply must be greater than 0.";

    }

    if (

        value >
        LIMITS.MAX_SUPPLY

    ) {

        return "Maximum supply is 1 Trillion.";

    }

    return "";

}

// =====================================================
// TAX
// =====================================================

export function validateTax(value) {

    value =
        Number(value);

    if (

        Number.isNaN(value)

    ) {

        return "Invalid tax.";

    }

    if (

        value < 0 ||
        value > LIMITS.MAX_TAX

    ) {

        return "Tax must be between 0% and 10%.";

    }

    return "";

}

// =====================================================
// PERCENT
// =====================================================

export function validatePercent(value) {

    value =
        Number(value);

    if (

        Number.isNaN(value)

    ) {

        return "Invalid percentage.";

    }

    if (

        value <
        LIMITS.MIN_PERCENT ||

        value >
        LIMITS.MAX_PERCENT

    ) {

        return "Percentage must be between 1 and 100.";

    }

    return "";

}

// =====================================================
// URL
// =====================================================

export function validateURL(url) {

    url = text(url);

    if (!url) {

        return "";

    }

    try {

        new URL(url);

        return "";

    }

    catch {

        return "Invalid URL.";

    }

}

// =====================================================
// ADDRESS
// =====================================================

export function validateAddress(address) {

    address =
        text(address);

    if (!address) {

        return "";

    }

    if (

        !isAddress(address)

    ) {

        return "Invalid wallet address.";

    }

    return "";

}

// =====================================================
// TAX RECEIVER
// =====================================================

export function validateTaxReceivers(config) {

  require(
    config.burnTaxShare <= 100,
    "Invalid burn share"
);
  
    if (

        !config.buyTaxEnabled &&
        !config.sellTaxEnabled

    ) {

        return "";

    }

    const burn =
        Number(
            config.burnTaxShare
        );

    const marketing =
        text(
            config.marketingWallet
        );

    const development =
        text(
            config.developmentWallet
        );

    if (

        burn > 0

    ) {

        return "";

    }

    if (

        marketing

    ) {

        return "";

    }

    if (

        development

    ) {

        return "";

    }

    return "Buy Tax or Sell Tax requires Burn Share or Marketing Wallet or Development Wallet.";

}

// =====================================================
// FORM VALIDATION
// =====================================================

export function validateConfig(config) {

    let error;

    error =
        validateName(
            config.name
        );

    if (error) {

        return error;

    }

    error =
        validateSymbol(
            config.symbol
        );

    if (error) {

        return error;

    }

    error =
        validateSupply(
            config.supply
        );

    if (error) {

        return error;

    }

    if (

        config.buyTaxEnabled

    ) {

        error =
            validateTax(
                config.buyTax
            );

        if (error) {

            return error;

        }

    }

    if (

        config.sellTaxEnabled

    ) {

        error =
            validateTax(
                config.sellTax
            );

        if (error) {

            return error;

        }

    }

    if (

        config.maxWalletEnabled

    ) {

        error =
            validatePercent(
                config.maxWalletPercent
            );

        if (error) {

            return error;

        }

    }

    if (

        config.maxTxEnabled

    ) {

        error =
            validatePercent(
                config.maxTxPercent
            );

        if (error) {

            return error;

        }

    }

    error =
        validateURL(
            config.website
        );

    if (error) {

        return error;

    }

    error =
        validateURL(
            config.telegram
        );

    if (error) {

        return error;

    }

    error =
        validateURL(
            config.twitter
        );

    if (error) {

        return error;

    }

    error =
        validateURL(
            config.logoURI
        );

    if (error) {

        return error;

    }

    error =
        validateAddress(
            config.marketingWallet
        );

    if (error) {

        return error;

    }

    error =
        validateAddress(
            config.developmentWallet
        );

    if (error) {

        return error;

    }

    error =
        validateTaxReceivers(
            config
        );

    if (error) {

        return error;

    }

    return "";

      }
