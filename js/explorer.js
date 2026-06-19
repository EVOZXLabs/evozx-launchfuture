import {
    formatUnits
} from "https://esm.sh/ethers@6";

import {
    getAllTokens
} from "./factory.js";

import {
    explorerToken
} from "./config.js";

// =====================================================
// STATE
// =====================================================

let allTokens = [];

let currentPage = 1;

const PAGE_SIZE = 20;

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

        return BigInt(
            value
        ).toLocaleString();

    }

    catch {

        return String(
            value
        );

    }

}

function renderStats() {

    const statsBar =
        document.getElementById(
            "statsBar"
        );

    if (!statsBar) {

        return;

    }

    const totalTokens =
        allTokens.length;

    const activeTokens =
        allTokens.filter(
            token => token.active
        ).length;

    let totalSupply =
        0n;

    for (const token of allTokens) {

        try {

            totalSupply +=
                BigInt(
                    token.supply
                );

        }

        catch {

        }

    }

    statsBar.innerHTML = `

        <div class="stat-card">

            <div class="stat-label">
                Total Tokens
            </div>

            <div class="stat-value">
                ${totalTokens}
            </div>

        </div>

        <div class="stat-card">

            <div class="stat-label">
                Active Tokens
            </div>

            <div class="stat-value">
                ${activeTokens}
            </div>

        </div>

        <div class="stat-card">

            <div class="stat-label">
                Total Supply
            </div>

            <div class="stat-value">
                ${totalSupply.toLocaleString()}
            </div>

        </div>

    `;

}

// =====================================================
// CARD
// =====================================================

function createTokenCard(token) {

    const template =
        document.getElementById(
            "tokenCardTemplate"
        );

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
        formatSupply(
            token.supply
        );

    fragment
    .querySelector(
        ".token-creator"
    )
    .textContent =
    shortAddress(
        token.creator
    );

    fragment
    .querySelector(
        ".token-created"
    )
    .textContent =
    new Date(
        Number(token.createdAt) * 1000
    ).toLocaleDateString();

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

            }

            catch (error) {

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

            location.href =
                `./token.html?address=${token.address}`;

        };

    console.log(
    "RENDER SUPPLY:",
    token.name,
    token.supply,
    formatSupply(token.supply)
);

    return fragment;

}

// =====================================================
// RENDER
// =====================================================

function renderTokens(tokens) {

    const container =
        document.getElementById(
            "tokenList"
        );

    const info =
        document.getElementById(
            "paginationInfo"
        );

    container.innerHTML = "";

    const start =
        (currentPage - 1) *
        PAGE_SIZE;

    const end =
        start +
        PAGE_SIZE;

    const pageTokens =
        tokens.slice(
            start,
            end
        );

    for (const token of pageTokens) {

        container.appendChild(

            createTokenCard(
                token
            )

        );

    }

    if (info) {

        info.textContent =

            `Showing ${pageTokens.length ? start + 1 : 0}-${Math.min(end, tokens.length)} of ${tokens.length} tokens`;

    }

    renderPagination(
        tokens
    );

}

function renderPagination(tokens) {

    const pagination =
        document.getElementById(
            "pagination"
        );

    if (!pagination) {

        return;

    }

    pagination.innerHTML = "";

    const totalPages =

        Math.ceil(
            tokens.length /
            PAGE_SIZE
        );

    if (totalPages <= 1) {

        return;

    }

    const prev =
        document.createElement(
            "button"
        );

    prev.className =
        "secondary-button";

    prev.textContent =
        "Previous";

    prev.disabled =
        currentPage === 1;

    prev.onclick =
        () => {

            currentPage--;

            renderTokens(
                tokens
            );

        };

    pagination.appendChild(
        prev
    );

    for (
        let page = 1;
        page <= totalPages;
        page++
    ) {

        const button =
            document.createElement(
                "button"
            );

        button.textContent =
            page;

        button.className =

            page === currentPage

                ? "primary-button"

                : "secondary-button";

        button.onclick =
            () => {

                currentPage =
                    page;

                renderTokens(
                    tokens
                );

            };

        pagination.appendChild(
            button
        );

    }

    const next =
        document.createElement(
            "button"
        );

    next.className =
        "secondary-button";

    next.textContent =
        "Next";

    next.disabled =
        currentPage === totalPages;

    next.onclick =
        () => {

            currentPage++;

            renderTokens(
                tokens
            );

        };

    pagination.appendChild(
        next
    );

}

// =====================================================
// LOAD
// =====================================================

async function loadExplorer() {

    const loading =
        document.getElementById(
            "loadingState"
        );

    try {

        const tokens =
            await getAllTokens();

        console.log(
            "FACTORY TOKENS:",
            tokens
        );

        allTokens = [];

        for (const item of tokens) {

            console.log(
                "TOKEN:",
                item
            );

            allTokens.push({

    address:
        item[0],

    creator:
        item[1],

    name:
        item[2],

    symbol:
        item[3],

    supply:
        item[4],

    createdAt:
        item[5],

    chainId:
        item[6],

    active:
        item[7]

  });

}

        console.log(
    "PUBLIC TOKENS:",
    allTokens
);
        console.log(
    "FIRST TOKEN DATA:",
    {
        name:
            allTokens[0]?.name,

        supply:
            String(
                allTokens[0]?.supply
            )
    }
);

console.log(
    "SECOND TOKEN DATA:",
    {
        name:
            allTokens[1]?.name,

        supply:
            String(
                allTokens[1]?.supply
            )
    }
);
        
        allTokens.sort(

    (a, b) =>

        a.name.localeCompare(
            b.name
        )

);

renderStats();

renderTokens(
    allTokens
);

    }

    catch (error) {

        console.error(
            "EXPLORER ERROR:",
            error
        );

    }

    finally {

        if (loading) {

            loading.hidden =
                true;

        }

    }

}

// =====================================================
// SEARCH
// =====================================================

function setupSearch() {

    const input =
        document.getElementById(
            "tokenSearch"
        );

    if (!input) {

        return;

    }

    input.addEventListener(

        "input",

        () => {

            const keyword =

                input.value
                    .trim()
                    .toLowerCase();

            if (!keyword) {

                renderTokens(
                    allTokens
                );

                return;

            }

            const filtered =

                allTokens.filter(

                    token =>

                        token.name
                            .toLowerCase()
                            .includes(
                                keyword
                            )

                        ||

                        token.symbol
                            .toLowerCase()
                            .includes(
                                keyword
                            )

                        ||

                        token.address
                            .toLowerCase()
                            .includes(
                                keyword
                            )

                );

            currentPage = 1;

renderTokens(
    filtered
);

        }

    );

}

// =====================================================
// STARTUP
// =====================================================

document.addEventListener(

    "DOMContentLoaded",

    async () => {

        await loadExplorer();

        setupSearch();

    }

);
