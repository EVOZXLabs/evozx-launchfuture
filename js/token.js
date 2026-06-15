import {

    Contract,
    JsonRpcProvider,
    formatUnits

} from "https://esm.sh/ethers@6";

import {

    NETWORK

} from "./config.js";

let tokenAbi = null;

let provider = null;

async function loadJson(path) {

    const response =
        await fetch(path);

    if (!response.ok) {

        throw new Error(
            "Unable to load ABI."
        );

    }

    return await response.json();

}

export async function loadAbi() {

    if (tokenAbi) {

        return tokenAbi;

    }

    tokenAbi =
        await loadJson(
            "./abi/token.json"
        );

    return tokenAbi;

}

function getProvider() {

    if (provider) {

        return provider;

    }

    provider =
        new JsonRpcProvider(
            NETWORK.rpc
        );

    return provider;

}

async function getToken(address) {

    const abi =
        await loadAbi();

    return new Contract(

        address,

        abi,

        getProvider()

    );

}

function getAddressFromUrl() {

    const params =
        new URLSearchParams(
            window.location.search
        );

    return params.get("address");

}

//
// =====================================================
// LOAD TOKEN
// =====================================================
//

export async function loadToken() {

    const address =
        getAddressFromUrl();

    if (!address) {

        throw new Error(
            "Token address not found."
        );

    }

    const token =
        await getToken(
            address
        );

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

//
// =====================================================
// FORMAT HELPERS
// =====================================================
//

function setText(
    selector,
    value
) {

    const element =
        document.querySelector(
            selector
        );

    if (!element) {

        return;

    }

    element.textContent =
        value;

}

function shortAddress(
    address
) {

    if (

        !address ||

        address ===
        "0x0000000000000000000000000000000000000000"

    ) {

        return "Not Set";

    }

    return (

        address.slice(0, 6)

        +

        "..."

        +

        address.slice(-4)

    );

}

function boolText(
    value
) {

    return value
        ? "Enabled"
        : "Disabled";

}

function boolClass(
    value
) {

    return value
        ? "status enabled"
        : "status disabled";

}

function setStatus(
    selector,
    value
) {

    const element =
        document.querySelector(
            selector
        );

    if (!element) {

        return;

    }

    element.textContent =
        boolText(
            value
        );

    element.className =
        boolClass(
            value
        );

}

function formatSupply(
    value
) {

    return formatUnits(

        value,

        18

    );

}

function explorerLink(
    address
) {

    return (

        NETWORK.explorer

        +

        "/address/"

        +

        address

    );

}

//
// =====================================================
// METADATA
// =====================================================
//

function renderMetadata(
    token
) {

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

    const logo =
        document.querySelector(
            "#logo"
        );

    if (

        logo &&

        token.logoURI

    ) {

        logo.src =
            token.logoURI;

    }

        }

//
// =====================================================
// BASIC INFO
// =====================================================
//

function renderBasic(
    token
) {

    setText(
        "#tokenName",
        token.name
    );

    setText(
        "#tokenSymbol",
        token.symbol
    );

    setText(
        "#owner",
        shortAddress(
            token.owner
        )
    );

    setText(
        "#tokenAddress",
        shortAddress(
            token.address
        )
    );

    setText(
        "#supply",
        formatSupply(
            token.totalSupply
        )
    );

    setText(
        "#chainId",
        String(
            token.deployedChainId
        )
    );

    setText(
        "#version",
        String(
            token.launchKitVersion
        )
    );

    }

//
// =====================================================
// FEATURES
// =====================================================
//

function renderFeatures(
    token
) {

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

//
// =====================================================
// SECURITY
// =====================================================
//

function renderSecurity(
    token
) {

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

            ? token.maxWalletPercent + "%"

            : "-"

    );

    setText(
        "#maxTxPercent",

        token.maxTxEnabled

            ? token.maxTxPercent + "%"

            : "-"

    );

}

//
// =====================================================
// TRADING
// =====================================================
//

function renderTrading(
    token
) {

    setStatus(
        "#tradingControlEnabled",
        token.tradingControlEnabled
    );

    setStatus(
        "#tradingEnabled",
        token.tradingEnabled
    );

}

//
// =====================================================
// TAX
// =====================================================
//

function renderTax(
    token
) {

    setStatus(
        "#buyTaxEnabled",
        token.buyTaxEnabled
    );

    setStatus(
        "#sellTaxEnabled",
        token.sellTaxEnabled
    );

    setText(

        "#buyTax",

        token.buyTaxEnabled

            ? token.buyTax + "%"

            : "-"

    );

    setText(

        "#sellTax",

        token.sellTaxEnabled

            ? token.sellTax + "%"

            : "-"

    );

    setText(

        "#burnShare",

        token.burnTaxShare + "%"

    );

    setText(

        "#marketingWallet",

        shortAddress(
            token.marketingWallet
        )

    );

    setText(

        "#developmentWallet",

        shortAddress(
            token.developmentWallet
        )

    );

}

//
// =====================================================
// DEX
// =====================================================
//

function renderDex(
    token
) {

    setStatus(
        "#pairInitialized",
        token.pairInitialized
    );

    setText(

        "#dexPair",

        shortAddress(
            token.dexPair
        )

    );

}

//
// =====================================================
// EXPLORER
// =====================================================
//

function renderExplorer(
    token
) {

    const explorer =
        document.querySelector(
            "#openExplorer"
        );

    if (

        !explorer

    ) {

        return;

    }

    explorer.onclick =
        () => {

            window.open(

                explorerLink(
                    token.address
                ),

                "_blank"

            );

        };

}

//
// =====================================================
// COPY ADDRESS
// =====================================================
//

function renderCopyButton(
    token
) {

    const button =
        document.querySelector(
            "#copyAddress"
        );

    if (

        !button

    ) {

        return;

    }

    button.onclick =
        async () => {

            await navigator.clipboard.writeText(

                token.address

            );

            button.textContent =
                "Copied";

            setTimeout(

                () => {

                    button.textContent =
                        "Copy";

                },

                1500

            );

        };

}

//
// =====================================================
// RENDER TOKEN
// =====================================================
//

async function renderToken() {

    try {

        const token =
            await loadToken();

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

        renderTax(
            token
        );

        renderDex(
            token
        );

        renderExplorer(
            token
        );

        renderCopyButton(
            token
        );

    }

    catch (error) {

        console.error(
            error
        );

        const container =
            document.querySelector(
                "#tokenContainer"
            );

        if (container) {

            container.innerHTML = `

                <div class="token-error">

                    <h2>

                        Unable to load token

                    </h2>

                    <p>

                        This address is not a valid LaunchKit token
                        or the contract is unavailable.

                    </p>

                </div>

            `;

        }

    }

}

//
// =====================================================
// NAVIGATION
// =====================================================
//

function bindNavigation() {

    const back =
        document.querySelector(
            "#backDashboard"
        );

    if (!back) {

        return;

    }

    back.onclick =
        () => {

            window.location.href =
                "./dashboard.html";

        };

}

//
// =====================================================
// INITIALIZE
// =====================================================
//

document.addEventListener(

    "DOMContentLoaded",

    () => {

        renderToken();

        bindNavigation();

    }

);
