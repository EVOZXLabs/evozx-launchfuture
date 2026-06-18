import {
    Contract,
    JsonRpcProvider,
    formatUnits
} from "https://esm.sh/ethers@6";

import {
    NETWORK,
    ABI,
    explorerAddress,
    isZeroAddress
} from "./config.js";

// =====================================================
// STATE
// =====================================================

let provider = null;

let tokenAbi = null;

// =====================================================
// DOM
// =====================================================

const $ = selector =>
    document.querySelector(selector);

function setText(id, value) {

    const element =
        document.getElementById(id);

    if (!element) {

        return;

    }

    element.textContent = value;

}

function setHTML(id, value) {

    const element =
        document.getElementById(id);

    if (!element) {

        return;

    }

    element.innerHTML = value;

}

// =====================================================
// HELPERS
// =====================================================

function shortAddress(address) {

    if (!address) {

        return "-";

    }

    return (

        address.slice(0, 6) +

        "..." +

        address.slice(-4)

    );

}

function formatSupply(value) {

    try {

        return Number(

            formatUnits(

                value,

                18

            )

        ).toLocaleString();

    }

    catch {

        return String(value);

    }

}

function formatStatus(value) {

    return value

        ? "Enabled"

        : "Disabled";

}

// =====================================================
// ABI
// =====================================================

async function loadAbi() {

    if (tokenAbi) {

        return tokenAbi;

    }

    const response =

        await fetch(

            ABI.token

        );

    if (!response.ok) {

        throw new Error(

            "Unable to load token ABI."

        );

    }

    tokenAbi =

        await response.json();

    return tokenAbi;

}

// =====================================================
// PROVIDER
// =====================================================

function getProvider() {

    if (provider) {

        return provider;

    }

    provider =

        new JsonRpcProvider(

            NETWORK.rpcUrl

        );

    return provider;

}

// =====================================================
// CONTRACT
// =====================================================

async function getTokenContract(address) {

    const abi =

        await loadAbi();

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

    return params.get(

        "address"

    );

}

// =====================================================
// LOAD TOKEN DATA
// =====================================================

export async function loadTokenData() {

    const address =

        getTokenAddress();

    if (!address) {

        throw new Error(

            "Token address not provided."

        );

    }

    const token =

        await getTokenContract(

            address

        );

    const [

        name,
        symbol,
        owner,
        totalSupply,

        deployedChainId,
        launchKitVersion,

        burnable,
        mintable,
        mintUsed,
        ownershipEnabled,

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

        token.burnable(),
        token.mintable(),
        token.mintUsed(),
        token.ownershipEnabled(),

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

        burnable,
        mintable,
        mintUsed,
        ownershipEnabled,

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
// STATUS
// =====================================================

function setStatus(id, enabled) {

    const element =

        document.getElementById(id);

    if (!element) {

        return;

    }

    element.textContent =

        enabled

            ? "Enabled"

            : "Disabled";

    element.className =

        enabled

            ? "status enabled"

            : "status disabled";

}

// =====================================================
// BASIC
// =====================================================

function renderBasic(token) {

    setText(

        "tokenName",

        token.name

    );

    setText(

        "tokenSymbol",

        token.symbol

    );

    setText(

        "tokenAddress",

        token.address

    );

    setText(

        "ownerAddress",

        token.owner

    );

    setText(

        "owner",

        shortAddress(

            token.owner

        )

    );

    setText(

        "supply",

        formatSupply(

            token.totalSupply

        )

    );

    setText(

        "chainId",

        String(

            token.deployedChainId

        )

    );

    setText(

        "version",

        String(

            token.launchKitVersion

        )

    );

}

// =====================================================
// METADATA
// =====================================================

function renderMetadata(token) {

    setText(

        "website",

        token.website || "-"

    );

    setText(

        "telegram",

        token.telegram || "-"

    );

    setText(

        "twitter",

        token.twitter || "-"

    );

    const logo =

        document.getElementById(

            "logo"

        );

    if (

        logo &&

        token.logoURI

    ) {

        logo.src =

            token.logoURI;

    }

}

// =====================================================
// FEATURES
// =====================================================

function renderFeatures(token) {

    setStatus(

        "burnable",

        token.burnable

    );

    setStatus(

        "mintable",

        token.mintable

    );

    setStatus(

        "ownership",

        token.ownershipEnabled

    );

    setStatus(

        "mintUsed",

        token.mintUsed

    );

}

// =====================================================
// SECURITY
// =====================================================

function renderSecurity(token) {

    setText(

        "maxWalletEnabled",

        formatStatus(

            token.maxWalletEnabled

        )

    );

    setText(

        "maxWalletPercent",

        token.maxWalletEnabled

            ? `${token.maxWalletPercent}%`

            : "-"

    );

    setText(

        "maxTxEnabled",

        formatStatus(

            token.maxTxEnabled

        )

    );

    setText(

        "maxTxPercent",

        token.maxTxEnabled

            ? `${token.maxTxPercent}%`

            : "-"

    );

}

// =====================================================
// TRADING & TAX
// =====================================================

function renderTrading(token) {

    setText(

        "tradingControlEnabled",

        formatStatus(

            token.tradingControlEnabled

        )

    );

    setText(

        "tradingEnabled",

        formatStatus(

            token.tradingEnabled

        )

    );

    setText(

        "buyTaxEnabled",

        formatStatus(

            token.buyTaxEnabled

        )

    );

    setText(

        "buyTax",

        token.buyTaxEnabled

            ? `${token.buyTax}%`

            : "-"

    );

    setText(

        "sellTaxEnabled",

        formatStatus(

            token.sellTaxEnabled

        )

    );

    setText(

        "sellTax",

        token.sellTaxEnabled

            ? `${token.sellTax}%`

            : "-"

    );

    setText(

        "burnTaxShare",

        Number(

            token.burnTaxShare

        ) > 0

            ? `${token.burnTaxShare}%`

            : "-"

    );

}

// =====================================================
// DISTRIBUTION
// =====================================================

function renderDistribution(token) {

    setText(

        "marketingWallet",

        isZeroAddress(

            token.marketingWallet

        )

            ? "-"

            : token.marketingWallet

    );

    setText(

        "developmentWallet",

        isZeroAddress(

            token.developmentWallet

        )

            ? "-"

            : token.developmentWallet

    );

}

// =====================================================
// DEX
// =====================================================

function renderDex(token) {

    setText(

        "pairInitialized",

        token.pairInitialized

            ? "Yes"

            : "No"

    );

    setText(

        "dexPair",

        isZeroAddress(

            token.dexPair

        )

            ? "-"

            : token.dexPair

    );

}

// =====================================================
// ACTIONS
// =====================================================

function bindActions(token) {

    const copyButton =

        document.getElementById(

            "copyAddress"

        );

    if (copyButton) {

        copyButton.onclick =

            async () => {

                try {

                    await navigator

                        .clipboard

                        .writeText(

                            token.address

                        );

                    copyButton.textContent =

                        "Copied";

                    setTimeout(

                        () => {

                            copyButton.textContent =

                                "Copy Address";

                        },

                        1500

                    );

                }

                catch (error) {

                    console.error(

                        error

                    );

                }

            };

    }

    const explorerButton =

        document.getElementById(

            "openExplorer"

        );

    if (explorerButton) {

        explorerButton.onclick =

            () => {

                window.open(

                    explorerAddress(

                        token.address

                    ),

                    "_blank"

                );

            };

    }

}

// =====================================================
// MAIN RENDER
// =====================================================

export async function renderToken() {

    try {

        const token =

            await loadTokenData();

        renderBasic(

            token

        );

        renderMetadata(

            token

        );

        renderFeatures(

            token

        );

        renderSecurity(

            token

        );

        renderTrading(

            token

        );

        renderDistribution(

            token

        );

        renderDex(

            token

        );

        bindActions(

            token

        );

    }

    catch (error) {

        console.error(

            error

        );

        const container =

            document.getElementById(

                "tokenContainer"

            );

        if (!container) {

            return;

        }

        container.innerHTML = `

<div class="empty-state">

    <h2>

        Unable To Load Token

    </h2>

    <p>

        This token address is invalid or the contract is not a supported LaunchFuture EVOZ20 token.

    </p>

</div>

`;

    }

}

// =====================================================
// INITIALIZE
// =====================================================

async function initialize() {

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

    initialize

};
