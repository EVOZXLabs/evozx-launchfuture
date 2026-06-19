import {
    Contract,
    formatUnits
} from "https://esm.sh/ethers@6";

import {
    getAllTokens,
    getReadProvider
} from "./factory.js";

import {
    CONTRACTS,
    ABI
} from "./config.js";

let tokenAbi = null;

let allTokens = [];

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

async function loadTokenAbi() {

    if (tokenAbi) {

        return tokenAbi;

    }

    const response =
        await fetch(
            ABI.token
        );

    tokenAbi =
        await response.json();

    return tokenAbi;

}

async function createTokenContract(
    address
) {

    return new Contract(

        address,

        await loadTokenAbi(),

        getReadProvider()

    );

}

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

function createTokenCard(
    token
) {

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
        formatToken(
            token.supply
        );

    const copyButton =
        fragment.querySelector(
            ".token-copy"
        );

    copyButton.onclick =
        async () => {

            await navigator
                .clipboard
                .writeText(
                    token.address
                );

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

    const addresses =
        await getAllTokens();

        const tokenAddresses =
    addresses[0];

    for (
    const address
    of tokenAddresses
)

            try {

                const token =
                    await loadTokenInfo(
                        address
                    );

                allTokens.push(
                    token
                );

            }

            catch (error) {

                console.error(
                    error
                );

            }

        }

        allTokens.sort(

            (a, b) =>

                a.name.localeCompare(
                    b.name
                )

        );

        for (
            const token
            of allTokens
        ) {

            container.appendChild(

                createTokenCard(
                    token
                )

            );

        }

    }

    finally {

        loading.hidden = true;

    }

      }

document.addEventListener(

    "DOMContentLoaded",

    loadExplorer

);
