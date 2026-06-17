import {
    Contract,
    JsonRpcProvider,
    formatUnits
} from "https://esm.sh/ethers@6";

import {
    NETWORK,
    ABI,
    STORAGE,
    explorerAddress,
    isZeroAddress
} from "./config.js";

let provider = null;
let tokenAbi = null;

// =====================================================
// ABI
// =====================================================

async function loadAbi() {

    if (tokenAbi) {
        return tokenAbi;
    }

    const response = await fetch(ABI.token);

    if (!response.ok) {
        throw new Error("Unable to load token ABI.");
    }

    tokenAbi = await response.json();

    return tokenAbi;

}

// =====================================================
// PROVIDER
// =====================================================

function getProvider() {

    if (!provider) {
        provider = new JsonRpcProvider(
            NETWORK.rpcUrl
        );
    }

    return provider;

}

// =====================================================
// CONTRACT
// =====================================================

async function getTokenContract(address) {

    const abi = await loadAbi();

    return new Contract(
        address,
        abi,
        getProvider()
    );

}

// =====================================================
// ADDRESS
// =====================================================

function getTokenAddress() {

    const params =
        new URLSearchParams(
            window.location.search
        );

    const query =
        params.get("address");

    if (query) {
        return query;
    }

    return sessionStorage.getItem(
        STORAGE.selectedToken
    );

}

// =====================================================
// LOAD TOKEN
// =====================================================

export async function loadToken() {

    const address =
        getTokenAddress();

    if (!address) {
        throw new Error("Token address not found.");
    }

    const token =
        await getTokenContract(address);

    const [
        name,
        symbol,
        owner,
        totalSupply,
        deployedChainId,
        launchKitVersion,
        ownershipEnabled,
        burnable,
        mintable,
        mintUsed,
        website,
        telegram,
        twitter,
        logoURI,
        maxWalletEnabled,
        maxWalletPercent,
        maxTxEnabled,
        maxTxPercent,
        tradingControlEnabled,
        tradingEnabled,
        buyTaxEnabled,
        buyTax,
        sellTaxEnabled,
        sellTax,
        burnTaxShare,
        marketingWallet,
        developmentWallet,
        dexPair,
        pairInitialized
    ] = await Promise.all([

        token.name(),
        token.symbol(),
        token.owner(),
        token.totalSupply(),

        token.deployedChainId(),
        token.launchKitVersion(),

        token.ownershipEnabled(),
        token.burnable(),
        token.mintable(),
        token.mintUsed(),

        token.website(),
        token.telegram(),
        token.twitter(),
        token.logoURI(),

        token.maxWalletEnabled(),
        token.maxWalletPercent(),

        token.maxTxEnabled(),
        token.maxTxPercent(),

        token.tradingControlEnabled(),
        token.tradingEnabled(),

        token.buyTaxEnabled(),
        token.buyTax(),

        token.sellTaxEnabled(),
        token.sellTax(),

        token.burnTaxShare(),

        token.marketingWallet(),
        token.developmentWallet(),

        token.dexPair(),
        token.pairInitialized()

    ]);

    return {

        address,

        name,
        symbol,
        owner,
        totalSupply,

        deployedChainId,
        launchKitVersion,

        ownershipEnabled,
        burnable,
        mintable,
        mintUsed,

        website,
        telegram,
        twitter,
        logoURI,

        maxWalletEnabled,
        maxWalletPercent,

        maxTxEnabled,
        maxTxPercent,

        tradingControlEnabled,
        tradingEnabled,

        buyTaxEnabled,
        buyTax,

        sellTaxEnabled,
        sellTax,

        burnTaxShare,

        marketingWallet,
        developmentWallet,

        dexPair,
        pairInitialized

    };

}

// =====================================================
// DOM HELPERS
// =====================================================

function $(selector) {
    return document.querySelector(selector);
}

function setText(selector, value) {
    const element = $(selector);
    if (element) {
        element.textContent = value;
    }
}

function setStatus(selector, enabled) {
    const element = $(selector);

    if (!element) {
        return;
    }

    element.textContent = enabled ? "Enabled" : "Disabled";
    element.className = enabled
        ? "status enabled"
        : "status disabled";
}

function shortAddress(address) {
    if (
        !address ||
        address === ethers.ZeroAddress
    ) {
        return "-";
    }

    return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

function formatSupply(value) {
    return formatUnits(value, 18);
}

function explorerAddress(address) {
    return `${NETWORK.explorer}/address/${address}`;
}

// =====================================================
// BASIC INFO
// =====================================================

function renderBasic(token) {

    setText("#tokenName", token.name);
    setText("#tokenSymbol", token.symbol);

    setText(
        "#tokenAddress",
        shortAddress(token.address)
    );

    setText(
        "#owner",
        shortAddress(token.owner)
    );

    setText(
        "#supply",
        formatSupply(token.totalSupply)
    );

    setText(
        "#chainId",
        String(token.deployedChainId)
    );

    setText(
        "#version",
        String(token.launchKitVersion)
    );
}

// =====================================================
// METADATA
// =====================================================

function renderMetadata(token) {

    setText(
        "#website",
        token.website || "-"
    );

    setText(
        "#telegram",
        token.telegram || "-"
    );

    setText(
        "#twitter",
        token.twitter || "-"
    );

    const logo = $("#logo");

    if (logo && token.logoURI) {
        logo.src = token.logoURI;
    }
}

// =====================================================
// FEATURES
// =====================================================

function renderFeatures(token) {

    setStatus(
        "#burnable",
        token.burnable
    );

    setStatus(
        "#mintable",
        token.mintable
    );

    setStatus(
        "#ownership",
        token.ownershipEnabled
    );

    setStatus(
        "#mintUsed",
        token.mintUsed
    );
}

// =====================================================
// SECURITY
// =====================================================

function renderSecurity(token) {

    setStatus(
        "#maxWalletEnabled",
        token.maxWalletEnabled
    );

    setStatus(
        "#maxTxEnabled",
        token.maxTxEnabled
    );

    setText(
        "#maxWalletPercent",
        token.maxWalletEnabled
            ? `${token.maxWalletPercent}%`
            : "-"
    );

    setText(
        "#maxTxPercent",
        token.maxTxEnabled
            ? `${token.maxTxPercent}%`
            : "-"
    );
}

// =====================================================
// TRADING
// =====================================================

function renderTrading(token) {

    setStatus(
        "#tradingControlEnabled",
        token.tradingControlEnabled
    );

    setStatus(
        "#tradingEnabled",
        token.tradingEnabled
    );
}

// =====================================================
// RENDER
// =====================================================

export async function renderToken() {

    try {

        const token = await loadTokenData();

        renderBasicInfo(token);

        renderMetadata(token);

        renderFeatures(token);

        renderSecurity(token);

        renderTrading(token);

        renderTax(token);

        renderDex(token);

        bindActions(token);

    }

    catch (error) {

        console.error(error);

        const container =
            $("#tokenContainer");

        if (container) {

            container.innerHTML = `

                <div class="empty-state">

                    <h2>Unable to load token</h2>

                    <p>
                        The supplied address is not a valid
                        LaunchFuture token contract.
                    </p>

                </div>

            `;

        }

    }

}

// =====================================================
// INITIALIZATION
// =====================================================

async function initialize() {

    bindNavigation();

    await renderToken();

}

document.addEventListener(

    "DOMContentLoaded",

    initialize

);

// =====================================================
// EXPORTS
// =====================================================

export {

    loadTokenData

};
