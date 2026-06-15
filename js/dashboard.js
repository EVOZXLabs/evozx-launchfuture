import {

    formatUnits

} from "https://esm.sh/ethers@6";

import {

    getTokensByCreator,
    getToken

} from "./factory.js";

import {

    getAccount

} from "./wallet.js";

let account = null;

let tokens = [];

function setText(

    selector,

    value

) {

    const element =
        document.querySelector(
            selector
        );

    if (element) {

        element.textContent =
            value;

    }

}

export function shortAddress(address) {

    if (!address) {

        return "";

    }

    return (

        address.slice(0, 6)

        +

        "..."

        +

        address.slice(-4)

    );

}

export async function copyAddress(address) {

    try {

        await navigator.clipboard.writeText(
            address
        );

        alert(
            "Address copied."
        );

    }

    catch {

        alert(
            "Copy failed."
        );

    }

}

export function openExplorer(address) {

    window.open(

        "https://evozscan.com/address/" +

        address,

        "_blank"

    );

}

function buildBadges(token) {

    const badges = [];

    if (token.active) {

        badges.push(

            `<span class="badge success">
                Active
            </span>`

        );

    }

    badges.push(

        `<span class="badge">
            ${token.symbol}
        </span>`

    );

    return badges.join("");

}

function buildCard(token) {

    const supply =
        formatUnits(

            token.supply,

            0

        );

    return `

<div class="token-card">

    <div class="token-header">

        <h3>

            ${token.name}

        </h3>

        ${buildBadges(token)}

    </div>

    <div class="token-body">

        <p>

            <strong>Symbol</strong>

            ${token.symbol}

        </p>

        <p>

            <strong>Supply</strong>

            ${supply}

        </p>

        <p>

            <strong>Address</strong>

            ${shortAddress(
                token.token
            )}

        </p>

    </div>

    <div class="token-actions">

        <button

            data-copy="${token.token}"

        >

            Copy

        </button>

        <button

            data-open="${token.token}"

        >

            Explorer

        </button>

        <button

            data-view="${token.token}"

        >

            Details

        </button>

    </div>

</div>

`;

}

//
// =====================================================
// EMPTY STATE
// =====================================================
//

function renderEmpty() {

    const container =
        document.querySelector(
            "#tokenList"
        );

    if (!container) {

        return;

    }

    container.innerHTML = `

<div class="empty-state">

    <h3>

        No Tokens Found

    </h3>

    <p>

        This wallet has not created any token yet.

    </p>

</div>

`;

}

//
// =====================================================
// TOKEN RENDER
// =====================================================
//

function renderTokens() {

    const container =
        document.querySelector(
            "#tokenList"
        );

    if (!container) {

        return;

    }

    if (tokens.length === 0) {

        renderEmpty();

        return;

    }

    container.innerHTML =
        tokens
            .map(buildCard)
            .join("");

}

//
// =====================================================
// LOAD TOKENS
// =====================================================
//

export async function loadTokens() {

    account =
        getAccount();

    if (!account) {

        renderEmpty();

        return;

    }

    const addresses =
        await getTokensByCreator(
            account
        );

    tokens = [];

    if (addresses.length === 0) {

        renderEmpty();

        return;

    }

    const total =
        addresses.length;

    for (

        let i = 0;

        i < total;

        i++

    ) {

        try {

            const token =
                await getToken(i);

            if (

                token.creator
                    .toLowerCase()

                !==

                account
                    .toLowerCase()

            ) {

                continue;

            }

            tokens.push(token);

        }

        catch (error) {

            console.error(error);

        }

    }

    renderTokens();

    setText(

        "#tokenCount",

        String(tokens.length)

    );

        }
