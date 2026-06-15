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

