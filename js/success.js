import {
    formatUnits
} from "https://esm.sh/ethers@6";

import {
    STORAGE,
    DOWNLOADS,
    explorerTransaction
} from "./config.js";

import {
    copyToClipboard
} from "./utils.js";

// =====================================================
// DOM
// =====================================================

function $(id) {

    return document.getElementById(id);

}

function setText(
    id,
    value
) {

    const element = $(id);

    if (!element) {

        return;

    }

    element.textContent =
        value ?? "-";

}

// =====================================================
// FORMAT
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

        return formatUnits(

            BigInt(value),

            18

        );

    }

    catch {

        return String(value);

    }

}

// =====================================================
// STORAGE
// =====================================================

function getDeployment() {

    try {

        const raw =

            localStorage.getItem(

                STORAGE.lastToken

            );

        if (!raw) {

            return null;

        }

        return JSON.parse(raw);

    }

    catch {

        return null;

    }

}

// =====================================================
// DOWNLOAD
// =====================================================

function downloadStandardInput() {

    window.open(

        DOWNLOADS.standardInput,

        "_blank"

    );

}

// =====================================================
// EXPLORER
// =====================================================

function bindExplorer(deployment) {

    const button =

        $("explorerLink");

    if (!button) {

        return;

    }

    button.href =

        explorerTransaction(

            deployment.hash

        );

    button.target =
        "_blank";

    button.rel =
        "noopener";

}

// =====================================================
// VIEW TOKEN
// =====================================================

function bindViewToken(deployment) {

    const link =

        document.querySelector(

            'a[href="./token.html"]'

        );

    if (!link) {

        return;

    }

    link.href =

        `./token.html?address=${deployment.token}`;

}

// =====================================================
// COPY ADDRESS
// =====================================================

function bindCopy(deployment) {

    const button =

        $("copyAddress");

    if (!button) {

        return;

    }

    button.onclick =
        async () => {

            const success =

                await copyToClipboard(

                    deployment.token

                );

            if (!success) {

                return;

            }

            const original =

                button.textContent;

            button.textContent =
                "Copied";

            setTimeout(

                () => {

                    button.textContent =
                        original;

                },

                1500

            );

        };

}

// =====================================================
// DOWNLOAD BUTTON
// =====================================================

function bindDownload() {

    const button =

        $("downloadStandardInput");

    if (!button) {

        return;

    }

    button.onclick =
        downloadStandardInput;

}

// =====================================================
// RENDER
// =====================================================

function renderDeployment(
    deployment
) {

    setText(
        "tokenName",
        deployment.name
    );

    setText(
        "tokenSymbol",
        deployment.symbol
    );

    setText(
        "tokenSupply",
        formatSupply(
            deployment.supply
        )
    );

    setText(
        "tokenAddress",
        shortAddress(
            deployment.token
        )
    );

    setText(
        "creator",
        shortAddress(
            deployment.creator
        )
    );

    setText(
        "chainId",
        deployment.chainId
    );

    setText(
        "txHash",
        shortAddress(
            deployment.hash
        )
    );

}

// =====================================================
// SUCCESS PAGE
// =====================================================

function renderSuccess() {

    const deployment =

        getDeployment();

    if (!deployment) {

        window.location.replace(

            "./launch.html"

        );

        return;

    }

    renderDeployment(
        deployment
    );

    bindExplorer(
        deployment
    );

    bindViewToken(
        deployment
    );

    bindCopy(
        deployment
    );

    bindDownload();

}

// =====================================================
// INIT
// =====================================================

function initializeSuccess() {

    renderSuccess();

}

document.addEventListener(

    "DOMContentLoaded",

    initializeSuccess

);

// =====================================================
// EXPORTS
// =====================================================

export {

    initializeSuccess,
    renderSuccess

};
