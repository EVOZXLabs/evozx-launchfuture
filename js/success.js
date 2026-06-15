import {

    formatUnits

} from "https://esm.sh/ethers@6";

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

export async function copyText(text) {

    try {

        await navigator.clipboard.writeText(
            text
        );

        alert(
            "Copied successfully."
        );

    }

    catch {

        alert(
            "Unable to copy."
        );

    }

}

export function getLastToken() {

    const raw =
        sessionStorage.getItem(

            "launchfuture_last_token"

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

function explorerUrl(address) {

    return (

        "https://evozscan.com/address/"

        +

        address

    );

}

function downloadStandardInput() {

    window.open(

        "./docs/standard-input.json",

        "_blank"

    );

}

//
// =====================================================
// RENDER SUCCESS
// =====================================================
//

export function renderSuccess() {

    const token =
        getLastToken();

    if (!token) {

        window.location.href =
            "./launch.html";

        return;

    }

    setText(

        "#tokenName",

        token.name

    );

    setText(

        "#tokenSymbol",

        token.symbol

    );

    setText(

        "#tokenSupply",

        formatUnits(

            token.supply,

            0

        )

    );

    setText(

        "#tokenAddress",

        shortAddress(
            token.token
        )

    );

    setText(

        "#chainId",

        String(
            token.chainId
        )

    );

    const explorer =
        document.querySelector(
            "#explorerLink"
        );

    if (explorer) {

        explorer.href =
            explorerUrl(
                token.token
            );

        explorer.target =
            "_blank";

    }

    const copyButton =
        document.querySelector(
            "#copyAddress"
        );

    if (copyButton) {

        copyButton.onclick =
            () =>

                copyText(
                    token.token
                );

    }

    const downloadButton =
        document.querySelector(
            "#downloadStandardInput"
        );

    if (downloadButton) {

        downloadButton.onclick =
            downloadStandardInput;

    }

}

//
// =====================================================
// NAVIGATION
// =====================================================
//

function bindNavigation() {

    const dashboard =
        document.querySelector(
            "#goDashboard"
        );

    if (dashboard) {

        dashboard.onclick =
            () => {

                window.location.href =
                    "./dashboard.html";

            };

    }

    const deployAgain =
        document.querySelector(
            "#deployAnother"
        );

    if (deployAgain) {

        deployAgain.onclick =
            () => {

                window.location.href =
                    "./launch.html";

            };

    }

}

//
// =====================================================
// INITIALIZE
// =====================================================
//

document.addEventListener(

    "DOMContentLoaded",

    () => {

        renderSuccess();

        bindNavigation();

    }

);
