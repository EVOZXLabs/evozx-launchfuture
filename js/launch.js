import {
    formatUnits
} from "https://esm.sh/ethers@6";

import {
    getDeploymentFee,
    getEVOZXBalance
} from "./factory.js";

import {
    estimatePurchase
} from "./exchange.js";

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

    return element
        ? element.value.trim()
        : "";

}

function isChecked(id) {

    const element = $(id);

    return element
        ? element.checked
        : false;

}

function enable(id, state = true) {

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
// FORM DATA
// =====================================================

function getFormData() {

    return {

        // BASIC

        name:
            getValue("name"),

        symbol:
            getValue("symbol"),

        supply:
            Number(
                getValue("supply")
            ),

        // FEATURES

        burnable:
            isChecked("burnable"),

        mintable:
            isChecked("mintable"),

        ownershipEnabled:
            isChecked("ownershipEnabled"),

        // SECURITY

        maxWalletEnabled:
            isChecked(
                "maxWalletEnabled"
            ),

        maxWalletPercent:
            Number(
                getValue(
                    "maxWalletPercent"
                )
            ) || 0,

        maxTxEnabled:
            isChecked(
                "maxTxEnabled"
            ),

        maxTxPercent:
            Number(
                getValue(
                    "maxTxPercent"
                )
            ) || 0,

        // TRADING

        tradingControlEnabled:
            isChecked(
                "tradingControlEnabled"
            ),

        tradingEnabled:
            isChecked(
                "tradingEnabled"
            ),

        // TAX

        buyTaxEnabled:
            isChecked(
                "buyTaxEnabled"
            ),

        buyTax:
            Number(
                getValue("buyTax")
            ) || 0,

        sellTaxEnabled:
            isChecked(
                "sellTaxEnabled"
            ),

        sellTax:
            Number(
                getValue("sellTax")
            ) || 0,

        burnTaxShare:
            Number(
                getValue(
                    "burnTaxShare"
                )
            ) || 0,

        // WALLETS

        marketingWallet:
            getValue(
                "marketingWallet"
            ),

        developmentWallet:
            getValue(
                "developmentWallet"
            ),

        // LINKS

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
// ACCORDION
// =====================================================

function initializeAccordion() {

    document

        .querySelectorAll(
            ".accordion"
        )

        .forEach(accordion => {

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

        });

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

    const buyTaxEnabled =
        isChecked(
            "buyTaxEnabled"
        );

    const sellTaxEnabled =
        isChecked(
            "sellTaxEnabled"
        );

    const taxEnabled =
        buyTaxEnabled ||
        sellTaxEnabled;

    enable(
        "buyTax",
        buyTaxEnabled
    );

    enable(
        "sellTax",
        sellTaxEnabled
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
// SYMBOL STATUS
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

    symbolTimer =
        setTimeout(
            updateSymbolStatus,
            400
        );

}

// =====================================================
// VALIDATION
// =====================================================

function validateForm() {

    const formData =
        getFormData();

    const error =
        validateConfig(
            formData
        );

    if (error) {

        setStatus(error);

        return false;

    }

    clearStatus();

    return true;

}

// =====================================================
// WALLET UI
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

        const balance =
            await getEVOZXBalance(
                account
            );

        setText(

            "walletEVOZXBalance",

            formatUnits(
                balance,
                18
            )

        );

    }

    catch {

        setText(
            "walletEVOZXBalance",
            "-"
        );

    }

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

}

// =====================================================
// DEPLOYMENT PREVIEW
// =====================================================

async function refreshPreview() {

    try {

        if (!validateForm()) {
            return;
        }

        const form =
            getFormData();

        const fee =
            await getDeploymentFee(
                form
            );

        setText(

            "deploymentFee",

            formatUnits(
                fee,
                18
            ) + " EVOZX"

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

        const evozxBalance =
            await getEVOZXBalance(
                account
            );

        setText(

            "evozxBalance",

            formatUnits(
                evozxBalance,
                18
            ) + " EVOZX"

        );

        const estimate =
            await estimatePurchase(
                fee
            );

        setText(

            "requiredEVOZ",

            formatUnits(
                estimate.requiredEVOZ,
                18
            ) + " EVOZ"

        );

        setText(

            "readyStatus",

            estimate.needPurchase

                ? "Auto EVOZX Purchase Required"

                : "Ready To Deploy"

        );

    }

    catch (error) {

        console.error(error);

        setStatus(

            error.message ||

            "Unable to load deployment preview."

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

    button.disabled = state;

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

    try {

        const account =
            getAccount();

        if (!account) {

            throw new Error(
                "Please connect your wallet first."
            );

        }

        if (!validateForm()) {
            return;
        }

        setDeployLoading(true);

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

        setDeployLoading(false);

    }

}

// =====================================================
// EVENTS
// =====================================================

function bindEvents() {

    document

        .querySelectorAll(
            "input, textarea"
        )

        .forEach(element => {

            element.addEventListener(

                "input",

                async () => {

                    updateFeatureState();

                    validateForm();

                    scheduleSymbolCheck();

                    await refreshPreview();

                }

            );

            element.addEventListener(

                "change",

                async () => {

                    updateFeatureState();

                    validateForm();

                    scheduleSymbolCheck();

                    await refreshPreview();

                }

            );

        });

}

// =====================================================
// WALLET LISTENERS
// =====================================================

function bindWalletListeners() {

    onAccountChanged(

        async () => {

            await updateWalletPreview();

            await refreshPreview();

        }

    );

}

// =====================================================
// INITIALIZE
// =====================================================

async function initialize() {

    try {

        await restoreConnection();

        initializeAccordion();

        updateFeatureState();

        bindEvents();

        bindWalletListeners();

        await updateSymbolStatus();

        await updateWalletPreview();

        await refreshPreview();

        const deployButton =
            $("deployButton");

        if (deployButton) {

            deployButton.addEventListener(

                "click",

                onDeploy

            );

        }

    }

    catch (error) {

        console.error(error);

        setStatus(

            error.message ||

            "Initialization failed."

        );

    }

}

// =====================================================
// PAGE LOAD
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
    refreshPreview,
    onDeploy

};
