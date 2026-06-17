import {
    STORAGE,
    DOWNLOADS,
    explorerToken
} from "./config.js";

import {
    copyToClipboard
} from "./utils.js";

// ======================================================
// DOM
// ======================================================

function $(id) {

    return document.getElementById(id);

}

function setText(id, value) {

    const element = $(id);

    if (!element) {

        return;

    }

    element.textContent = value;

}

// ======================================================
// ADDRESS
// ======================================================

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

// ======================================================
// STORAGE
// ======================================================

function getLastDeployment() {

    const raw = sessionStorage.getItem(
        STORAGE.lastToken
    );

    if (!raw) {

        return null;

    }

    try {

        return JSON.parse(raw);

    }

    catch {

        return null;

    }

}

// ======================================================
// DOWNLOAD
// ======================================================

function downloadStandardInput() {

    window.open(

        DOWNLOADS.standardInput,

        "_blank"

    );

}

// ======================================================
// RENDER
// ======================================================

function renderSuccess() {

    const token = getLastDeployment();

    if (!token) {

        window.location.href =
            "./launch.html";

        return;

    }

    setText(
        "tokenName",
        token.name
    );

    setText(
        "tokenSymbol",
        token.symbol
    );

    setText(
        "tokenSupply",
        token.supply
    );

    setText(
        "tokenAddress",
        shortAddress(
            token.token
        )
    );

    setText(
        "chainId",
        String(
            token.chainId
        )
    );

    const explorer =
        $("explorerLink");

    if (explorer) {

        explorer.href =
            explorerToken(
                token.token
            );

        explorer.target =
            "_blank";

    }

    const copyButton =
        $("copyAddress");

    if (copyButton) {

        copyButton.onclick =
            async () => {

                const ok =
                    await copyToClipboard(
                        token.token
                    );

                if (!ok) {

                    return;

                }

                copyButton.textContent =
                    "Copied";

                setTimeout(

                    () => {

                        copyButton.textContent =
                            "Copy";

                    },

                    1500

                );

            };

    }

    const downloadButton =
        $("downloadStandardInput");

    if (downloadButton) {

        downloadButton.onclick =
            downloadStandardInput;

    }

}

// ======================================================
// NAVIGATION
// ======================================================

function bindNavigation() {

    const dashboard =
        $("goDashboard");

    if (dashboard) {

        dashboard.onclick =
            () => {

                window.location.href =
                    "./dashboard.html";

            };

    }

    const deployAgain =
        $("deployAnother");

    if (deployAgain) {

        deployAgain.onclick =
            () => {

                window.location.href =
                    "./launch.html";

            };

    }

}

// ======================================================
// INITIALIZE
// ======================================================

async function initializeSuccess() {

    renderSuccess();

    bindNavigation();

}

document.addEventListener(

    "DOMContentLoaded",

    initializeSuccess

);

// ======================================================
// EXPORTS
// ======================================================

export {

    initializeSuccess,
    renderSuccess

};
