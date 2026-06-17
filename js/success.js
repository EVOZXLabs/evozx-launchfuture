import {
    formatUnits
} from "https://esm.sh/ethers@6";

import {
    STORAGE_KEYS,
    DOWNLOADS,
    explorerAddress,
    explorerTransaction
} from "./config.js";

import {
    copyToClipboard
} from "./utils.js";

// =====================================================
// DOM HELPERS
// =====================================================

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

// =====================================================
// FORMAT HELPERS
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

function getLastDeployment() {

    const raw =
        localStorage.getItem(
            STORAGE_KEYS.lastDeployment
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
// RENDER
// =====================================================

function renderSuccess() {

    const deployment =
        getLastDeployment();

    if (!deployment) {

        window.location.href =
            "./launch.html";

        return;

    }

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
        String(
            deployment.chainId
        )
    );

    setText(
        "txHash",
        shortAddress(
            deployment.hash
        )
    );

// ==========================================
    // EXPLORER
    // ==========================================

    const explorer =
        $("explorerLink");

    if (explorer) {

        explorer.href =
            explorerTransaction(
                deployment.hash
            );

        explorer.target =
            "_blank";

    }

    // ==========================================
    // VIEW TOKEN
    // ==========================================

    const viewToken =
        $("viewToken");

    if (viewToken) {

        viewToken.href =
            `./token.html?address=${deployment.token}`;

    }

    // ==========================================
    // COPY ADDRESS
    // ==========================================

    const copyButton =
        $("copyAddress");

    if (copyButton) {

        copyButton.onclick =
            async () => {

                const copied =
                    await copyToClipboard(
                        deployment.token
                    );

                if (!copied) {

                    return;

                }

                copyButton.textContent =
                    "Copied";

                setTimeout(

                    () => {

                        copyButton.textContent =
                            "Copy Address";

                    },

                    1500

                );

            };

    }

    // ==========================================
    // DOWNLOAD STANDARD INPUT
    // ==========================================

    const download =
        $("downloadStandardInput");

    if (download) {

        download.onclick =
            downloadStandardInput;

    }

}

// =====================================================
// INITIALIZE
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
