import {

    connectWallet,

    restoreConnection,

    updateWalletButtons,

    isConnected

} from "./wallet.js";

import {

    getFactoryName,

    getVersion,

    getTotalTokens

} from "./factory.js";

//
// =====================================================
// DOM HELPERS
// =====================================================
//

function setText(
    id,
    value
) {

    const element =
        document.getElementById(
            id
        );

    if (!element) {

        return;

    }

    element.textContent =
        value;

}

//
// =====================================================
// FACTORY INFO
// =====================================================
//

async function loadFactoryInformation() {

    try {

        const [

            name,

            version,

            total

        ] = await Promise.all([

            getFactoryName(),

            getVersion(),

            getTotalTokens()

        ]);

        setText(
            "factoryName",
            name
        );

        setText(
            "factoryVersion",
            version
        );

        setText(
            "totalTokens",
            total
        );

    }

    catch (error) {

        console.error(
            error
        );

        setText(
            "factoryName",
            "Unavailable"
        );

        setText(
            "factoryVersion",
            "-"
        );

        setText(
            "totalTokens",
            "-"
        );

    }

}

//
// =====================================================
// WALLET
// =====================================================
//

function bindWalletButton() {

    const button =
        document.getElementById(
            "connectWallet"
        );

    if (!button) {

        return;

    }

    button.addEventListener(

        "click",

        async () => {

            if (

                !isConnected()

            ) {

                await connectWallet();

            }

            updateWalletButtons();

        }

    );

        }
