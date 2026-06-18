import {
    Contract,
    formatUnits
} from "https://esm.sh/ethers@6";

import {
    CONTRACTS,
    ABI,
    STORAGE
} from "./config.js";

import {
    getReadProvider,
    getTokensByCreator,
    getEVOZXBalance
} from "./factory.js";

import {
    getAccount,
    onAccountChanged,
    initializeWallet,
    restoreConnection
} from "./wallet.js";

// =====================================================
// CONSTANTS
// =====================================================

const DEAD_ADDRESS =
    "0x000000000000000000000000000000000000dEaD";

// =====================================================
// STATE
// =====================================================

let tokenAbi = null;
let evozxAbi = null;

let tokenCache = [];

// =====================================================
// DOM
// =====================================================

const $ = id =>
    document.getElementById(id);

// =====================================================
// HELPERS
// =====================================================

function setText(id, value) {

    const element = $(id);

    if (!element) {

        return;

    }

    element.textContent =
        value ?? "-";

}

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

function clearContainer(id) {

    const element = $(id);

    if (!element) {

        return;

    }

    element.innerHTML = "";

}

function formatToken(value) {

    try {

        return Number(

            formatUnits(
                value,
                18
            )

        ).toLocaleString();

    }

    catch {

        return "0";

    }

}

function showLoading(state) {

    const element =
        $("loadingState");

    if (!element) {

        return;

    }

    element.hidden =
        !state;

}

function showEmpty(state) {

    const element =
        $("emptyState");

    if (!element) {

        return;

    }

    element.hidden =
        !state;

}

// =====================================================
// ABI
// =====================================================

async function loadTokenAbi() {

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

async function loadEVOZXAbi() {

    if (evozxAbi) {

        return evozxAbi;

    }

    const response =
        await fetch(
            ABI.evozx
        );

    if (!response.ok) {

        throw new Error(
            "Unable to load EVOZX ABI."
        );

    }

    evozxAbi =
        await response.json();

    return evozxAbi;

}

// =====================================================
// CONTRACTS
// =====================================================

async function createTokenContract(
    address
) {

    const abi =
        await loadTokenAbi();

    return new Contract(

        address,

        abi,

        getReadProvider()

    );

}

async function getEVOZXContract() {

    const abi =
        await loadEVOZXAbi();

    return new Contract(

        CONTRACTS.evozx,

        abi,

        getReadProvider()

    );

}

// =====================================================
// WALLET SUMMARY
// =====================================================

async function loadWalletSummary() {

    const account =
        getAccount();

    if (!account) {

        setText(
            "dashboardWallet",
            "Not Connected"
        );

        setText(
            "dashboardEVOZ",
            "-"
        );

        setText(
            "dashboardTotalTokens",
            0
        );

        return;

    }

    setText(
        "dashboardWallet",
        shortAddress(account)
    );

    try {

        const provider =
            getReadProvider();

        console.log(
            "PROVIDER:",
            provider
        );

        const evozBalance =
            await provider.getBalance(
                account
            );

        console.log(
            "BALANCE:",
            evozBalance.toString()
        );

        setText(
            "dashboardEVOZ",
            `${Number(
                formatUnits(
                    evozBalance,
                    18
                )
            ).toLocaleString()} EVOZ`
        );

    }

    catch (error) {

        console.error(
            "EVOZ BALANCE ERROR:",
            error
        );

        setText(
            "dashboardEVOZ",
            "-"
        );

    }

    try {

    const balance =
        await getEVOZXBalance(
            account
        );

    setText(
        "dashboardEVOZX",
        `${Number(
            formatUnits(
                balance,
                18
            )
        ).toLocaleString()} EVOZX`
    );

}
catch (error) {

    console.error(
        "EVOZX BALANCE ERROR:",
        error
    );

    setText(
        "dashboardEVOZX",
        error?.message || "ERROR"
    );

}

}

// =====================================================
// PLATFORM STATISTICS
// =====================================================

async function loadPlatformStatistics() {

    try {

        const contract =
            await getEVOZXContract();

        const burned =

            await contract.balanceOf(
                DEAD_ADDRESS
            );

        setText(

            "totalBurnedEVOZX",

            formatToken(
                burned
            )

        );

    }

    catch (error) {

        console.error(error);

        setText(
            "totalBurnedEVOZX",
            "-"
        );

    }

}

// =====================================================
// TOKEN INFO
// =====================================================

async function loadTokenInfo(
    address
) {

    const token =
        await createTokenContract(
            address
        );

    const [

        name,
        symbol,
        supply

    ] = await Promise.all([

        token.name(),

        token.symbol(),

        token.totalSupply()

    ]);

    return {

        address,

        name,

        symbol,

        supply

    };

}

// =====================================================
// TOKEN CARD
// =====================================================

function createTokenCard(
    token
) {

    const template =

        document.getElementById(
            "tokenCardTemplate"
        );

    if (!template) {

        return document.createDocumentFragment();

    }

    const fragment =

        template.content.cloneNode(
            true
        );

    fragment

        .querySelector(
            ".token-name"
        )

        .textContent =
        token.name;

    fragment

        .querySelector(
            ".token-symbol"
        )

        .textContent =
        token.symbol;

    fragment

        .querySelector(
            ".token-address"
        )

        .textContent =
        shortAddress(
            token.address
        );

    fragment

        .querySelector(
            ".token-supply"
        )

        .textContent =
        formatToken(
            token.supply
        );

    const copyButton =

        fragment.querySelector(
            ".token-copy"
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

                    const original =

                        copyButton.textContent;

                    copyButton.textContent =
                        "Copied";

                    setTimeout(

                        () => {

                            copyButton.textContent =
                                original;

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

        fragment.querySelector(
            ".token-explorer"
        );

    if (explorerButton) {

        explorerButton.onclick =
            () => {

                window.open(

                    `${CONTRACTS.explorer}/token/${token.address}`,

                    "_blank"

                );

            };

    }

    const detailsButton =

        fragment.querySelector(
            ".token-details"
        );

    if (detailsButton) {

        detailsButton.onclick =
            () => {

                location.href =

                    `./token.html?address=${token.address}`;

            };

    }

    return fragment;

}

// =====================================================
// MY TOKENS
// =====================================================

async function loadTokens() {

    const account =
        getAccount();

    clearContainer(
        "tokenList"
    );

    showEmpty(false);

    if (!account) {

        setText(
            "dashboardTotalTokens",
            0
        );

        showEmpty(true);

        return;

    }

    try {

        showLoading(true);

        const addresses =

            await getTokensByCreator(
                account
            );

        tokenCache = [];

        if (

            !addresses ||

            addresses.length === 0

        ) {

            setText(
                "dashboardTotalTokens",
                0
            );

            showLoading(false);

            showEmpty(true);

            return;

        }

        for (
            const address
            of addresses
        ) {

            try {

                const token =

                    await loadTokenInfo(
                        address
                    );

                tokenCache.push(
                    token
                );

            }

            catch (error) {

                console.error(
                    address,
                    error
                );

            }

        }

        tokenCache.sort(

            (a, b) =>

                a.name.localeCompare(
                    b.name
                )

        );

        const container =
            $("tokenList");

        for (
            const token
            of tokenCache
        ) {

            container.appendChild(

                createTokenCard(
                    token
                )

            );

        }

        setText(

            "dashboardTotalTokens",

            tokenCache.length

        );

        showLoading(false);

    }

    catch (error) {

        console.error(error);

        showLoading(false);

        showEmpty(true);

    }

            }
// =====================================================
// DEPLOYMENT HISTORY
// =====================================================

function loadHistory() {

    const container =
        $("historyList");

    if (!container) {

        return;

    }

    let history = [];

    try {

        history = JSON.parse(

            localStorage.getItem(
                STORAGE.deployHistory
            ) || "[]"

        );

    }

    catch {

        history = [];

    }

    setText(
        "historyCount",
        history.length
    );

    if (!history.length) {

        container.innerHTML = `

<div class="empty-state">

    <h3>

        No Deployment History

    </h3>

    <p>

        No deployment records found.

    </p>

</div>

`;

        return;

    }

    container.innerHTML =

        history.map(item => `

<div class="history-item">

    <div class="history-header">

        <strong>

            ${item.name}

            (${item.symbol})

        </strong>

        <span>

            ${new Date(
                item.deployedAt
            ).toLocaleString()}

        </span>

    </div>

    <div class="history-body">

        <div>

            <span>

                Address

            </span>

            <strong>

                ${shortAddress(
                    item.token
                )}

            </strong>

        </div>

        <div>

            <span>

                Transaction

            </span>

            <strong>

                <a
                    href="${explorerTransaction(
                        item.hash
                    )}"
                    target="_blank"
                    rel="noopener">

                    ${shortAddress(
                        item.hash
                    )}

                </a>

            </strong>

        </div>

    </div>

</div>

`).join("");

}

// =====================================================
// QUICK ACTIONS
// =====================================================

function bindQuickActions() {

    const launchButton =

        $("launchTokenButton");

    if (launchButton) {

        launchButton.onclick =
            () => {

                location.href =
                    "./launch.html";

            };

    }

    const homeButton =

        $("homeButton");

    if (homeButton) {

        homeButton.onclick =
            () => {

                location.href =
                    "./index.html";

            };

    }

}

// =====================================================
// WALLET LISTENERS
// =====================================================

function bindWalletListeners() {

    onAccountChanged(

        async () => {

            await loadWalletSummary();

            await loadTokens();

        }

    );

}

// =====================================================
// INITIAL LOAD
// =====================================================

async function loadDashboard() {

    await loadWalletSummary();

    await loadTokens();

    await loadPlatformStatistics();

    loadHistory();

}

// =====================================================
// INITIALIZE
// =====================================================

async function initialize() {

    try {

        await initializeWallet();

        bindWalletListeners();

        bindQuickActions();

        await loadDashboard();

    }

    catch (error) {

        console.error(error);

        showLoading(false);

        showEmpty(true);

    }

}

// =====================================================
// STARTUP
// =====================================================

document.addEventListener(

    "DOMContentLoaded",

    initialize

);
