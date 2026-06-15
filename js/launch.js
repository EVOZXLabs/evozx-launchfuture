import {
    formatUnits
} from "https://esm.sh/ethers@6";

import {

    getDeploymentFee,

    getDeploymentPreview

} from "./factory.js";

import {
    validateConfig,
    checkSymbol
} from "./validation.js";

import {

    deployToken

} from "./deploy.js";

import {

    calculateEVOZNeeded

} from "./exchange.js";

import {

    getAccount

} from "./wallet.js";

// =====================================================
// DOM HELPERS
// =====================================================

function $(id) {

    return document.getElementById(id);

}

function setText(id, value) {

    const el = $(id);

    if (!el) {

        return;

    }

    el.textContent =
        value;

}

function setHTML(id, value) {

    const el = $(id);

    if (!el) {

        return;

    }

    el.innerHTML =
        value;

}

function show(id) {

    const el = $(id);

    if (!el) {

        return;

    }

    el.hidden = false;

}

function hide(id) {

    const el = $(id);

    if (!el) {

        return;

    }

    el.hidden = true;

}

function value(id) {

    const el = $(id);

    if (!el) {

        return "";

    }

    return el.value.trim();

}

function checked(id) {

    const el = $(id);

    if (!el) {

        return false;

    }

    return el.checked;

}

function enable(id, state = true) {

    const el = $(id);

    if (!el) {

        return;

    }

    el.disabled = !state;

}

// =====================================================
// STATE
// =====================================================

let currentFee = 0n;

let symbolTimer = null;

let deploying = false;

let currentConfig = null;

// =====================================================
// ACCORDION
// =====================================================

function initAccordion() {

    const items =
        document.querySelectorAll(
            ".accordion"
        );

    items.forEach(item => {

        const header =
            item.querySelector(
                ".accordion-header"
            );

        const body =
            item.querySelector(
                ".accordion-body"
            );

        if (

            !header ||
            !body

        ) {

            return;

        }

        header.addEventListener(
            "click",

            () => {

                item.classList.toggle(
                    "open"
                );

            }

        );

    });

}

// =====================================================
// LOADING
// =====================================================

function setLoading(state) {

    deploying =
        state;

    const button =
        $("deployButton");

    if (!button) {

        return;

    }

    button.disabled =
        state;

    button.classList.toggle(
        "loading",
        state
    );

    button.textContent =
        state
            ? "Deploying..."
            : "Deploy Token";

}

// =====================================================
// STATUS
// =====================================================

function clearStatus() {

    setText(
        "statusText",
        ""
    );

}

function setStatus(message) {

    setText(
        "statusText",
        message
    );

}

// =====================================================
// FEE DISPLAY
// =====================================================

function updateFeeDisplay(fee) {

    currentFee =
        fee;

    setText(

        "deploymentFee",

        Number(
            formatUnits(
                fee,
                18
            )
        ).toLocaleString()

        + " EVOZX"

    );

}

// =====================================================
// SYMBOL CHECK
// =====================================================

async function scheduleSymbolCheck() {

    clearTimeout(
        symbolTimer
    );

    symbolTimer =
        setTimeout(

            async () => {

                const result =
                    await checkSymbol(
                        value(
                            "symbol"
                        )
                    );

                if (

                    result.exists

                ) {

                    setStatus(
                        result.message
                    );

                    return;

                }

                clearStatus();

            },

            400

        );

}

// =====================================================
// EVENTS
// =====================================================

function bindBasicEvents() {

    const symbol =
        $("symbol");

    if (symbol) {

        symbol.addEventListener(

            "input",

            scheduleSymbolCheck

        );

    }
    
const fields =

    document.querySelectorAll(

        "input,select,textarea"

    );

fields.forEach(

    field =>

        field.addEventListener(

            "input",

            calculate

        )

);
    
}

// =====================================================
// INITIALIZATION
// =====================================================

export function initializeLaunchPage() {

    initAccordion();

    bindBasicEvents();

    calculate();

}

// =====================================================
// BUILD TOKEN CONFIG
// =====================================================

function buildConfig() {

    currentConfig = {

        // ==========================================
        // BASIC
        // ==========================================

        name:
            value("name"),

        symbol:
            value("symbol"),

        supply:
    Math.floor(

        Number(
            value("supply")
        )

    ),

        owner:
            "0x0000000000000000000000000000000000000000",

        // ==========================================
        // DEPLOYMENT
        // ==========================================

        chainId:
            0,

        launchKitVersion:
            0,

        // ==========================================
        // CORE FEATURES
        // ==========================================

        burnable:
            checked("burnable"),

        mintable:
            checked("mintable"),

        ownershipEnabled:
            checked("ownership"),

        // ==========================================
        // METADATA
        // ==========================================

        website:
            value("website"),

        telegram:
            value("telegram"),

        twitter:
            value("twitter"),

        logoURI:
            value("logoURI"),

        // ==========================================
        // SECURITY
        // ==========================================

        maxWalletEnabled:
            checked("maxWalletEnabled"),

        maxWalletPercent:

            Number(
                value("maxWalletPercent")
            ) || 0,

        maxTxEnabled:
            checked("maxTxEnabled"),

        maxTxPercent:

            Number(
                value("maxTxPercent")
            ) || 0,

        tradingControlEnabled:
            checked("tradingControlEnabled"),

        tradingEnabled:
            checked("tradingEnabled"),

        // ==========================================
        // TOKENOMICS
        // ==========================================

        buyTaxEnabled:
            checked("buyTaxEnabled"),

        buyTax:

            Number(
                value("buyTax")
            ) || 0,

        sellTaxEnabled:
            checked("sellTaxEnabled"),

        sellTax:

            Number(
                value("sellTax")
            ) || 0,

        burnTaxShare:

            Number(
                value("burnTaxShare")
            ) || 0,

        marketingWallet:
            value("marketingWallet"),

        developmentWallet:
            value("developmentWallet")

    };

    return currentConfig;

}

// =====================================================
// VALIDATE CURRENT CONFIG
// =====================================================

function validateCurrentConfig() {

    const config =
        buildConfig();

    const error =
        validateConfig(
            config
        );

    if (error) {

        setStatus(
            error
        );

        return false;

    }

    clearStatus();

    return true;

}

// =====================================================
// CURRENT CONFIG
// =====================================================

export function getCurrentConfig() {

    return buildConfig();

}

// =====================================================
// LIVE DEPLOYMENT FEE
// =====================================================

async function calculate() {

    try {

        const config =
            buildConfig();

        const valid =
            validateCurrentConfig();

        if (!valid) {

            return;

        }

        const fee =
            await getDeploymentFee(
                config
            );

        updateFeeDisplay(
            fee
        );

        const account =
            getAccount();

        if (!account) {

            return;

        }

        const preview =
            await getDeploymentPreview(

                config,

                account

            );

        // ------------------------------------------

        setText(

            "evozxBalance",

            Number(

                formatUnits(

                    preview.balance,

                    18

                )

            ).toLocaleString()

        );

        // ------------------------------------------

        const missing =

            preview.balance >= preview.fee

                ? 0n

                : preview.fee -
                  preview.balance;

        setText(

            "missingEVOZX",

            Number(

                formatUnits(

                    missing,

                    18

                )

            ).toLocaleString()

        );

        // ------------------------------------------

        const evozNeeded =
            await calculateEVOZNeeded(
                missing
            );

        setText(

            "neededEVOZ",

            Number(

                formatUnits(

                    evozNeeded,

                    18

                )

            ).toLocaleString()

        );

        // ------------------------------------------

        if (

            preview.enoughBalance

        ) {

            setText(

                "readyStatus",

                "Ready to Deploy"

            );

        }

        else {

            setText(

                "readyStatus",

                "EVOZX will be purchased automatically"

            );

        }

    }

    catch (error) {

        console.error(
            error
        );

        setStatus(
            error.message
        );

    }

    }

