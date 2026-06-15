import {

    formatEther,
    formatUnits

} from "https://esm.sh/ethers@6";

import {

    getDeploymentFee,
    getDeploymentPreview,
    getEVOZXBalance

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

    getAccount,
    restoreConnection

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

                await refreshSymbolIndicator();

            },

            400

        );

}

// =====================================================
// EVENTS
// =====================================================

function bindBasicEvents() {

    // ------------------------------------------
    // SYMBOL
    // ------------------------------------------

    const symbol =
        $("symbol");

    if (symbol) {

        symbol.addEventListener(
            "input",
            scheduleSymbolCheck
        );

    }

    // ------------------------------------------
    // INPUT
    // ------------------------------------------

    document
        .querySelectorAll(
            "input[type='text'],input[type='number'],input[type='url'],textarea"
        )
        .forEach(

            element =>

                element.addEventListener(

                    "input",

                    calculate

                )

        );

    // ------------------------------------------
    // CHECKBOX
    // ------------------------------------------

    document
        .querySelectorAll(
            "input[type='checkbox']"
        )
        .forEach(

            element =>

                element.addEventListener(

                    "change",

                    () => {

                        updateFeatureState();

                        calculate();

                    }

                )

        );

}

// =====================================================
// INITIALIZATION
// =====================================================

export function initializeLaunchPage() {

    initAccordion();

    bindBasicEvents();

    updateFeatureState();

    calculate();

    refreshSymbolIndicator();

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
// FEATURE UI
// =====================================================

function updateFeatureState() {

    // ------------------------------------------
    // MAX WALLET
    // ------------------------------------------

    enable(

        "maxWalletPercent",

        checked(
            "maxWalletEnabled"
        )

    );

    // ------------------------------------------
    // MAX TX
    // ------------------------------------------

    enable(

        "maxTxPercent",

        checked(
            "maxTxEnabled"
        )

    );

    // ------------------------------------------
    // TRADING
    // ------------------------------------------

    enable(

        "tradingEnabled",

        checked(
            "tradingControlEnabled"
        )

    );

    // ------------------------------------------
    // BUY TAX
    // ------------------------------------------

    const buy =
        checked(
            "buyTaxEnabled"
        );

    enable(
        "buyTax",
        buy
    );

    // ------------------------------------------
    // SELL TAX
    // ------------------------------------------

    const sell =
        checked(
            "sellTaxEnabled"
        );

    enable(
        "sellTax",
        sell
    );

    // ------------------------------------------
    // TAX RECEIVER
    // ------------------------------------------

    const taxEnabled =
        buy || sell;

    enable(
        "burnTaxShare",
        taxEnabled
    );

    enable(
        "marketingWallet",
        taxEnabled
    );

    enable(
        "developmentWallet",
        taxEnabled
    );

}

// =====================================================
// SYMBOL INDICATOR
// =====================================================

async function refreshSymbolIndicator() {

    const result =
        await checkSymbol(

            value(
                "symbol"
            )

        );

    const badge =
        $("symbolStatus");

    if (!badge) {

        return;

    }

    if (!value("symbol")) {

        badge.textContent = "";

        badge.className = "";

        return;

    }

    if (result.exists) {

        badge.textContent =
            "Already Used";

        badge.className =
            "badge badge-red";

        return;

    }

    badge.textContent =
        "Available";

    badge.className =
        "badge badge-green";

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

// =====================================================
// DEPLOYMENT SUMMARY
// =====================================================

export async function updateDeploymentSummary() {

    try {

        if (!connectedAccount) {

            return;

        }

        const config =
            buildConfig();

        const fee =
            await getDeploymentFee(
                config
            );

        currentFee =
            fee;

        setText(

            "#deployFee",

            formatUnits(
                fee,
                18
            ) + " EVOZX"

        );

        const balance =
            await getEVOZXBalance(
                connectedAccount
            );

        setText(

            "#walletBalance",

            formatUnits(
                balance,
                18
            ) + " EVOZX"

        );

        if (balance >= fee) {

            setText(

                "#needToBuy",

                "0 EVOZ"

            );

            setText(

                "#deploymentStatus",

                "Ready to deploy"

            );

            document
                .querySelector(
                    "#deploymentStatus"
                )
                ?.classList
                .remove("warning");

        }

        else {

            const missing =
                fee - balance;

            const needed =
                await calculateEVOZNeeded(
                    missing
                );

            setText(

                "#needToBuy",

                formatEther(
                    needed
                ) + " EVOZ"

            );

            setText(

                "#deploymentStatus",

                "Additional EVOZX required"

            );

            document
                .querySelector(
                    "#deploymentStatus"
                )
                ?.classList
                .add("warning");

        }

        updateContinueState();

    }

    catch (error) {

        console.error(error);

    }

}

//
// =====================================================
// AUTO UPDATE
// =====================================================
//

export async function refreshLaunchUI() {

    await calculate();

    await updateDeploymentSummary();

}

//
// =====================================================
// EVENT BINDING
// =====================================================
//

export function bindFormEvents() {

    const inputs =
        document.querySelectorAll(

            "input, textarea, select"

        );

    for (const input of inputs) {

        input.addEventListener(

            "input",

            refreshLaunchUI

        );

        input.addEventListener(

            "change",

            refreshLaunchUI

        );

    }

}

//
// =====================================================
// INITIALIZE
// =====================================================
//

export async function initializeLaunch() {

    connectedAccount =
        getAccount();

    bindFormEvents();

    await refreshLaunchUI();

                    }

//
// =====================================================
// DEPLOY BUTTON
// =====================================================
//

let deploying = false;

async function onDeployClick() {

    if (deploying) {

        return;

    }

    deploying = true;

    try {

        const button =
            document.querySelector(
                "#deployButton"
            );

        if (button) {

            button.disabled = true;

            button.classList.add(
                "loading"
            );

            button.textContent =
                "Deploying...";

        }

        const result =
            await deployToken();

        sessionStorage.setItem(

            "launchfuture_last_token",

            JSON.stringify(result)

        );

        window.location.href =
            "./success.html";

    }

    catch (error) {

        console.error(error);

        alert(
            error.message ??
            "Deployment failed."
        );

    }

    finally {

        deploying = false;

        const button =
            document.querySelector(
                "#deployButton"
            );

        if (button) {

            button.disabled = false;

            button.classList.remove(
                "loading"
            );

            button.textContent =
                "Deploy Token";

        }

    }

}

//
// =====================================================
// WALLET STATE
// =====================================================
//

async function refreshWalletState() {

    connectedAccount =
        getAccount();

    if (!connectedAccount) {

        updateContinueState();

        return;

    }

    await refreshLaunchUI();

}

//
// =====================================================
// PAGE INITIALIZATION
// =====================================================
//

document.addEventListener(

    "DOMContentLoaded",

    async () => {

        try {

            await restoreConnection();

        }

        catch {

        }

        await refreshWalletState();

        const deployButton =
            document.querySelector(
                "#deployButton"
            );

        if (deployButton) {

            deployButton.addEventListener(

                "click",

                onDeployClick

            );

        }

    }

);

//
// =====================================================
// EXPORTS
// =====================================================
//

export {

    onDeployClick,

    refreshWalletState

};
