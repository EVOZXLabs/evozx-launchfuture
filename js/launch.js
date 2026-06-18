import {
    formatUnits
} from "https://esm.sh/ethers@6";

import {
    getDeploymentFee,
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
    getAccount,
    onAccountChanged,
    restoreConnection
} from "./wallet.js";

// =====================================================
// DOM
// =====================================================

const $ = id =>
    document.getElementById(id);

function setText(id, value) {

    const element = $(id);

    if (!element) {
        return;
    }

    element.textContent = value;

}

function getValue(id) {

    const element = $(id);

    if (!element) {
        return "";
    }

    return element.value.trim();

}

function getNumber(id) {

    const value =
        Number(getValue(id));

    return Number.isFinite(value)
        ? value
        : 0;

}

function isChecked(id) {

    const element = $(id);

    return element
        ? element.checked
        : false;

}

function enable(id, state) {

    const element = $(id);

    if (!element) {
        return;
    }

    element.disabled = !state;

}

// =====================================================
// STATE
// =====================================================

let deployRunning = false;

let symbolTimer = null;

// =====================================================
// STATUS
// =====================================================

function setStatus(message = "") {

    setText(
        "statusText",
        message
    );

}

function clearStatus() {

    setStatus("");

}

// =====================================================
// HELPERS
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

function formatToken(value) {

    try {

        return formatUnits(
            value,
            18
        );

    }

    catch {

        return "0";

    }

}

// =====================================================
// FORM DATA
// =====================================================

function getFormData() {

    return {

        name:
            getValue("name"),

        symbol:
            getValue("symbol"),

        supply:
            getNumber("supply"),

        burnable:
            isChecked("burnable"),

        mintable:
            isChecked("mintable"),

        ownershipEnabled:
            isChecked(
                "ownershipEnabled"
            ),

        maxWalletEnabled:
            isChecked(
                "maxWalletEnabled"
            ),

        maxWalletPercent:
            getNumber(
                "maxWalletPercent"
            ),

        maxTxEnabled:
            isChecked(
                "maxTxEnabled"
            ),

        maxTxPercent:
            getNumber(
                "maxTxPercent"
            ),

        tradingControlEnabled:
            isChecked(
                "tradingControlEnabled"
            ),

        tradingEnabled:
            isChecked(
                "tradingEnabled"
            ),

        buyTaxEnabled:
            isChecked(
                "buyTaxEnabled"
            ),

        buyTax:
            getNumber(
                "buyTax"
            ),

        sellTaxEnabled:
            isChecked(
                "sellTaxEnabled"
            ),

        sellTax:
            getNumber(
                "sellTax"
            ),

        burnTaxShare:
            getNumber(
                "burnTaxShare"
            ),

        marketingWallet:
            getValue(
                "marketingWallet"
            ),

        developmentWallet:
            getValue(
                "developmentWallet"
            ),

        website:
            getValue("website"),

        telegram:
            getValue("telegram"),

        twitter:
            getValue("twitter"),

        logoURI:
            getValue("logoURI")

    };

}

// =====================================================
// ACCORDION
// =====================================================

function initializeAccordion() {

    const accordions =

        document.querySelectorAll(
            ".accordion"
        );

    accordions.forEach(
        accordion => {

            const header =

                accordion.querySelector(
                    ".accordion-header"
                );

            if (!header) {
                return;
            }

            header.addEventListener(
                "click",
                () => {

                    accordion.classList.toggle(
                        "open"
                    );

                }
            );

        }
    );

}

// =====================================================
// FEATURE STATE
// =====================================================

function updateFeatureState() {

    enable(

        "maxWalletPercent",

        isChecked(
            "maxWalletEnabled"
        )

    );

    enable(

        "maxTxPercent",

        isChecked(
            "maxTxEnabled"
        )

    );

    enable(

        "tradingEnabled",

        isChecked(
            "tradingControlEnabled"
        )

    );

    const buyEnabled =

        isChecked(
            "buyTaxEnabled"
        );

    const sellEnabled =

        isChecked(
            "sellTaxEnabled"
        );

    const taxEnabled =

        buyEnabled ||

        sellEnabled;

    enable(
        "buyTax",
        buyEnabled
    );

    enable(
        "sellTax",
        sellEnabled
    );

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
// SYMBOL CHECK
// =====================================================

async function updateSymbolStatus() {

    const badge =
        $("symbolStatus");

    if (!badge) {
        return;
    }

    const symbol =
        getValue("symbol");

    if (!symbol) {

        badge.textContent = "";

        badge.className =
            "badge";

        return;

    }

    try {

        const result =
            await checkSymbol(
                symbol
            );

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

    catch {

        badge.textContent = "";

        badge.className =
            "badge";

    }

}

function scheduleSymbolCheck() {

    clearTimeout(
        symbolTimer
    );

    symbolTimer = setTimeout(

        updateSymbolStatus,

        500

    );

}

// =====================================================
// VALIDATION
// =====================================================

function validateForm() {

    const config =
        getFormData();

    const error =
        validateConfig(
            config
        );

    if (error) {

        setStatus(error);

        return false;

    }

    clearStatus();

    return true;

}

// =====================================================
// WALLET PREVIEW
// =====================================================

async function updateWalletPreview() {

    const account =
        getAccount();

    if (!account) {

        setText(
            "walletAddress",
            "Not Connected"
        );

        setText(
            "walletEVOZBalance",
            "-"
        );

        setText(
            "walletEVOZXBalance",
            "-"
        );

        return;

    }

    setText(
        "walletAddress",
        shortAddress(account)
    );

    try {

        const nativeBalance =

            await window.ethereum.request({

                method:
                    "eth_getBalance",

                params: [

                    account,

                    "latest"

                ]

            });

        setText(

            "walletEVOZBalance",

            formatUnits(

                BigInt(nativeBalance),

                18

            )

        );

    }

    catch {

        setText(
            "walletEVOZBalance",
            "-"
        );

    }

    try {

        const evozxBalance =

            await getEVOZXBalance(
                account
            );

        setText(

            "walletEVOZXBalance",

            formatToken(
                evozxBalance
            )

        );

    }

    catch {

        setText(
            "walletEVOZXBalance",
            "-"
        );

    }

}

// =====================================================
// DEPLOYMENT PREVIEW
// =====================================================

async function refreshPreview() {

    try {

        const form =
            getFormData();

        const fee =
            await getDeploymentFee(
                form
            );

        setText(

            "deploymentFee",

            `${formatToken(fee)} EVOZX`

        );

        const account =
            getAccount();

        if (!account) {

            setText(
                "evozxBalance",
                "-"
            );

            setText(
                "requiredEVOZ",
                "-"
            );

            setText(

                "readyStatus",

                "Connect Wallet"

            );

            return;

        }

        const balance =

            await getEVOZXBalance(
                account
            );

        setText(

            "evozxBalance",

            `${formatToken(balance)} EVOZX`

        );

        setText(
            "requiredEVOZ",
            "-"
        );

        if (!validateForm()) {

            setText(

                "readyStatus",

                "Invalid Configuration"

            );

            return;

        }

        if (balance < fee) {

            setText(

                "readyStatus",

                "Insufficient EVOZX"

            );

            return;

        }

        setText(

            "readyStatus",

            "Ready To Deploy"

        );

    }

    catch (error) {

        console.error(error);

        setStatus(

            error.message ||

            "Unable to load preview."

        );

    }

}

// =====================================================
// DEPLOY BUTTON
// =====================================================

function setDeployLoading(state) {

    deployRunning = state;

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
// DEPLOY
// =====================================================

async function onDeploy() {

    if (deployRunning) {
        return;
    }

    const account =
        getAccount();

    if (!account) {

        setStatus(

            "Connect wallet first."

        );

        return;

    }

    if (!validateForm()) {
        return;
    }

    try {

        setDeployLoading(
            true
        );

        setStatus(

            "Waiting for wallet confirmation..."

        );

        await deployToken(

            getFormData()

        );

    }

    catch (error) {

        console.error(error);

        setStatus(

            error.message ||

            "Deployment failed."

        );

    }

    finally {

        setDeployLoading(
            false
        );

    }

                }

// =====================================================
// EVENTS
// =====================================================

function bindInputs() {

    document

        .querySelectorAll(

            "input, textarea"

        )

        .forEach(element => {

            element.addEventListener(

                "input",

                async () => {

                    updateFeatureState();

                    scheduleSymbolCheck();

                    await refreshPreview();

                }

            );

            element.addEventListener(

                "change",

                async () => {

                    updateFeatureState();

                    scheduleSymbolCheck();

                    await refreshPreview();

                }

            );

        });

}

function bindDeployButton() {

    const button =
        $("deployButton");

    if (!button) {
        return;
    }

    button.addEventListener(

        "click",

        onDeploy

    );

}

// =====================================================
// WALLET EVENTS
// =====================================================

function bindWalletEvents() {

    onAccountChanged(

        async () => {

            await updateWalletPreview();

            await refreshPreview();

        }

    );

}

// =====================================================
// INITIAL LOAD
// =====================================================

async function loadInitialState() {

    updateFeatureState();

    await updateSymbolStatus();

    await updateWalletPreview();

    await refreshPreview();

}

// =====================================================
// INITIALIZE
// =====================================================

async function initialize() {

    try {

        await restoreConnection();

        initializeAccordion();

        bindInputs();

        bindDeployButton();

        bindWalletEvents();

        await loadInitialState();

    }

    catch (error) {

        console.error(error);

        setStatus(

            error.message ||

            "Unable to initialize launch page."

        );

    }

}

// =====================================================
// STARTUP
// =====================================================

document.addEventListener(

    "DOMContentLoaded",

    initialize

);

// =====================================================
// EXPORTS
// =====================================================

export {

    initialize,

    onDeploy,

    refreshPreview,

    getFormData

};
