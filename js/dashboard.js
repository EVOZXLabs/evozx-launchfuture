import {
    Contract,
    formatUnits,
    parseUnits
} from "https://esm.sh/ethers@6";

import {
    CONTRACTS,
    ABI,
    STORAGE,
    explorerToken,
    explorerTransaction
} from "./config.js";

import {
    getReadProvider,
    getTokensByCreator,
    getEVOZXBalance
} from "./factory.js";

import {
    getAccount,
    getSigner,
    restoreConnection,
    onAccountChanged
} from "./wallet.js";

// =====================================================
// STATE
// =====================================================

let tokenAbi = null;
let evozxAbi = null;

let tokenCache = [];

// =====================================================
// DOM
// =====================================================

const tokenList =
    document.getElementById(
        "tokenList"
    );

const loadingState =
    document.getElementById(
        "loadingState"
    );

const emptyState =
    document.getElementById(
        "emptyState"
    );

const template =
    document.getElementById(
        "tokenCardTemplate"
    );

// =====================================================
// HELPERS
// =====================================================

function $(id) {

    return document.getElementById(
        id
    );

}

function setText(id, value) {

    const element = $(id);

    if (!element) {
        return;
    }

    element.textContent =
        String(value);

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

function showLoading(state) {

    if (!loadingState) {
        return;
    }

    loadingState.hidden =
        !state;

}

function showEmpty(state) {

    if (!emptyState) {
        return;
    }

    emptyState.hidden =
        !state;

}

function clearTokens() {

    if (!tokenList) {
        return;
    }

    tokenList.innerHTML = "";

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

    const signer =
        getSigner();

    if (!signer) {

        throw new Error(
            "Wallet not connected."
        );

    }

    return new Contract(

        CONTRACTS.evozx,

        abi,

        signer

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
            "dashboardEVOZX",
            "-"
        );

        return;

    }

    setText(

        "dashboardWallet",

        shortAddress(
            account
        )

    );

    try {

        const nativeBalance =
            await window.ethereum.request({

                method:
                    "eth_getBalance",

                params: [

                    account,

                    "latest"

                ]

            });

        setText(

            "dashboardEVOZ",

            Number(

                formatUnits(
                    BigInt(
                        nativeBalance
                    ),
                    18
                )

            ).toLocaleString()

        );

    }

    catch {

        setText(
            "dashboardEVOZ",
            "-"
        );

    }

    try {

        const evozx =
            await getEVOZXBalance(
                account
            );

        setText(

            "dashboardEVOZX",

            Number(

                formatUnits(
                    evozx,
                    18
                )

            ).toLocaleString()

        );

    }

    catch {

        setText(
            "dashboardEVOZX",
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
        Number(

            formatUnits(
                token.supply,
                18
            )

        ).toLocaleString();

    const copyButton =
        fragment.querySelector(
            ".token-copy"
        );

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
                            "Copy";

                    },

                    1500

                );

            }

            catch (
                error
            ) {

                console.error(
                    error
                );

            }

        };

    const explorerButton =
        fragment.querySelector(
            ".token-explorer"
        );

    explorerButton.onclick =
        () => {

            window.open(

                explorerToken(
                    token.address
                ),

                "_blank"

            );

        };

    const detailsButton =
        fragment.querySelector(
            ".token-details"
        );

    detailsButton.onclick =
        () => {

            sessionStorage.setItem(

                "selectedToken",

                token.address

            );

            location.href =

                `./token.html?address=${token.address}`;

        };

    return fragment;

}

// =====================================================
// LOAD TOKENS
// =====================================================

async function loadTokens() {

    const account =
        getAccount();

    clearTokens();

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

            catch (
                error
            ) {

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

        clearTokens();

        for (
            const token
            of tokenCache
        ) {

            tokenList.appendChild(

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

    catch (
        error
    ) {

        console.error(
            error
        );

        showLoading(false);

        showEmpty(true);

    }

        }

// =====================================================
// DEPLOYMENT HISTORY
// =====================================================

function loadHistory() {

    const raw =
        localStorage.getItem(
            STORAGE.deployHistory
        ) ?? "[]";

    let history = [];

    try {

        history =
            JSON.parse(raw);

    }

    catch {

        history = [];

    }

    setText(
        "historyCount",
        history.length
    );

    const container =
        $("historyList");

    if (!container) {
        return;
    }

    if (!history.length) {

        container.innerHTML = `

<div class="empty-state">

<h3>No Deployment History</h3>

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

    <div class="history-item-header">

        <strong>

            ${item.name}

            (${item.symbol})

        </strong>

        <span class="history-item-date">

            ${new Date(
                item.deployedAt
            ).toLocaleString()}

        </span>

    </div>

    <div class="history-item-body">

        <div>

            <span>

                Token

            </span>

            <strong>

                ${shortAddress(
                    item.token
                )}

            </strong>

        </div>

        <div>

            <span>

                Creator

            </span>

            <strong>

                ${shortAddress(
                    item.creator
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
                    target="_blank">

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
// BURN EVOZX
// =====================================================

async function burnEVOZX() {

    const account =
        getAccount();

    if (!account) {

        throw new Error(
            "Wallet not connected."
        );

    }

    const input =
        $("burnAmount");

    if (!input) {
        return;
    }

    const amount =
        input.value.trim();

    if (!amount) {

        throw new Error(
            "Enter EVOZX amount."
        );

    }

    const contract =
        await getEVOZXContract();

    const tx =
        await contract.burn(

            parseUnits(
                amount,
                18
            )

        );

    setText(
        "burnStatus",
        "Waiting confirmation..."
    );

    await tx.wait();

    setText(
        "burnStatus",
        "EVOZX burned successfully."
    );

    input.value = "";

    await loadWalletSummary();

}

function bindBurnButton() {

    const button =
        $("burnButton");

    if (!button) {
        return;
    }

    button.addEventListener(

        "click",

        async () => {

            try {

                button.disabled =
                    true;

                await burnEVOZX();

            }

            catch (error) {

                console.error(
                    error
                );

                setText(

                    "burnStatus",

                    error.message ||

                    "Burn failed."

                );

            }

            finally {

                button.disabled =
                    false;

            }

        }

    );

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
// INITIALIZE
// =====================================================

async function initialize() {

    try {

        await restoreConnection();

        await loadWalletSummary();

        await loadTokens();

        loadHistory();

        bindBurnButton();

        bindWalletListeners();

    }

    catch (error) {

        console.error(
            error
        );

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

// =====================================================
// EXPORTS
// =====================================================

export {

    initialize,
    loadTokens,
    loadHistory

};
