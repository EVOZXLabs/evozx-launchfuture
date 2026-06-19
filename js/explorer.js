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

// =====================================================
// TOKEN CARD
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
        .querySelector(".token-name")
        .textContent =
        token.name;

    fragment
        .querySelector(".token-symbol")
        .textContent =
        token.symbol;

    fragment
        .querySelector(".token-address")
        .textContent =
        shortAddress(
            token.address
        );

    fragment
        .querySelector(".token-supply")
        .textContent =
        formatToken(
            token.supply
        );

    const copyButton =

        fragment.querySelector(
            ".token-copy"
        );

    copyButton.onclick =
        async () => {

            try {

                await navigator.clipboard.writeText(
                    token.address
                );

            }

            catch (error) {

                console.error(error);

            }

        };

    const explorerButton =

        fragment.querySelector(
            ".token-explorer"
        );

    explorerButton.onclick =
        () => {

            window.open(

                `${CONTRACTS.explorer}/token/${token.address}`,

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
// LOAD EXPLORER
// =====================================================

async function loadExplorer() {

    const loading =

        document.getElementById(
            "loadingState"
        );

    const container =

        document.getElementById(
            "tokenList"
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

        container.innerHTML = "";

        for (const token of allTokens) {

            container.appendChild(

                createTokenCard(
                    token
                )

            );

        }

    }

    catch (error) {

        console.error(
            "EXPLORER ERROR:",
            error
        );

    }

    finally {

        if (loading) {

            loading.hidden = true;

        }

    }

}

// =====================================================
// STARTUP
// =====================================================

function renderTokens(
    tokens
) {

    const container =
        document.getElementById(
            "tokenList"
        );

    container.innerHTML = "";

    renderTokens(
    allTokens
);

}

function setupSearch() {

    const input =
        document.getElementById(
            "tokenSearch"
        );

    input.addEventListener(
        "input",
        () => {

            const keyword =
                input.value
                    .trim()
                    .toLowerCase();

            const filtered =
                allTokens.filter(
                    token =>
                        token.name
                            .toLowerCase()
                            .includes(keyword)

                        ||

                        token.symbol
                            .toLowerCase()
                            .includes(keyword)

                        ||

                        token.address
                            .toLowerCase()
                            .includes(keyword)
                );

            renderTokens(
                filtered
            );

        }
    );

}

document.addEventListener(

    "DOMContentLoaded",

    async () => {

        await loadExplorer();

        setupSearch();

    }

);
