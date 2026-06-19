import {
    formatUnits
} from "https://esm.sh/ethers@6";

import {
    getAllTokens
} from "./factory.js";

import {
    CONTRACTS
} from "./config.js";

// =====================================================
// STATE
// =====================================================

let allTokens = [];

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

        try {

            return Number(
                value
            ).toLocaleString();

        }

        catch {

            return String(
                value
            );

        }

    }

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

                `${CONTRACTS.explorer}/address/${token.address}`,

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

    container.innerHTML = "";

    for (const token of tokens) {

        container.appendChild(

            createTokenCard(
                token
            )

        );

    }

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
                    item.token,

                name:
                    item.name,

                symbol:
                    item.symbol,

                supply:
                    item.supply,

                creator:
                    item.creator,

                createdAt:
                    item.createdAt,

                active:
                    item.active

            });

        }

        allTokens.sort(

            (a, b) =>

                a.name.localeCompare(
                    b.name
                )

        );

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
