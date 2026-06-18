import {
    BrowserProvider
} from "https://esm.sh/ethers@6";

import {
    NETWORK,
    STORAGE
} from "./config.js";

// =====================================================
// STATE
// =====================================================

let provider = null;
let signer = null;
let account = null;
let chainId = null;

let initialized = false;

const accountListeners = [];
const chainListeners = [];

// =====================================================
// HELPERS
// =====================================================

export function hasWallet() {

    return typeof window.ethereum !== "undefined";

}

export function getProvider() {

    return provider;

}

export function getSigner() {

    return signer;

}

export function getAccount() {

    return account;

}

export function getChainId() {

    return chainId;

}

export function isConnected() {

    return account !== null;

}

export function shortAddress(address) {

    if (!address) {

        return "";

    }

    return (
        address.slice(0, 6) +
        "..." +
        address.slice(-4)
    );

}

// =====================================================
// CALLBACKS
// =====================================================

export function onAccountChanged(callback) {

    if (typeof callback !== "function") {

        return;

    }

    accountListeners.push(
        callback
    );

}

export function onChainChanged(callback) {

    if (typeof callback !== "function") {

        return;

    }

    chainListeners.push(
        callback
    );

}

function emitAccountChanged(value) {

    for (const callback of accountListeners) {

        try {

            callback(value);

        }

        catch (error) {

            console.error(error);

        }

    }

}

function emitChainChanged(value) {

    for (const callback of chainListeners) {

        try {

            callback(value);

        }

        catch (error) {

            console.error(error);

        }

    }

}

// =====================================================
// UI
// =====================================================

export function updateWalletUI() {

    document
        .querySelectorAll("#connectWallet")
        .forEach(button => {

            button.textContent =

                account

                    ? shortAddress(account)

                    : "Connect Wallet";

            button.dataset.connected =

                account

                    ? "true"

                    : "false";

        });

    const walletAddress =
        document.getElementById(
            "walletAddress"
        );

    if (walletAddress) {

        walletAddress.textContent =

            account

                ? shortAddress(account)

                : "Not Connected";

    }

    const dashboardWallet =
        document.getElementById(
            "dashboardWallet"
        );

    if (dashboardWallet) {

        dashboardWallet.textContent =

            account

                ? shortAddress(account)

                : "-";

    }

}
// =====================================================
// NETWORK
// =====================================================

export async function checkNetwork() {

    if (!hasWallet()) {

        return false;

    }

    const currentChainId =
        await window.ethereum.request({

            method:
                "eth_chainId"

        });

    return (

        currentChainId.toLowerCase() ===
        NETWORK.chainIdHex.toLowerCase()

    );

}

export async function switchNetwork() {

    if (!hasWallet()) {

        throw new Error(
            "Wallet not detected."
        );

    }

    try {

        await window.ethereum.request({

            method:
                "wallet_switchEthereumChain",

            params: [

                {
                    chainId:
                        NETWORK.chainIdHex
                }

            ]

        });

    }

    catch (error) {

        if (error.code !== 4902) {

            throw error;

        }

        await window.ethereum.request({

            method:
                "wallet_addEthereumChain",

            params: [

                {

                    chainId:
                        NETWORK.chainIdHex,

                    chainName:
                        NETWORK.name,

                    nativeCurrency: {

                        name:
                            NETWORK.symbol,

                        symbol:
                            NETWORK.symbol,

                        decimals:
                            NETWORK.decimals

                    },

                    rpcUrls: [

                        NETWORK.rpcUrl

                    ],

                    blockExplorerUrls: [

                        NETWORK.explorer

                    ]

                }

            ]

        });

    }

}

// =====================================================
// INTERNAL
// =====================================================

async function hydrateWallet(address) {

    provider =
        new BrowserProvider(
            window.ethereum
        );

    signer =
        await provider.getSigner();

    account =
        address;

    const network =
        await provider.getNetwork();

    chainId =
        Number(
            network.chainId
        );

    updateWalletUI();

    emitAccountChanged(
        account
    );

    emitChainChanged(
        chainId
    );

}

function clearWalletState() {

    provider = null;

    signer = null;

    account = null;

    chainId = null;

    localStorage.removeItem(
        STORAGE.wallet
    );

    updateWalletUI();

    emitAccountChanged(
        null
    );

    emitChainChanged(
        null
    );

}

// =====================================================
// CONNECT
// =====================================================

export async function connectWallet() {

    if (!hasWallet()) {

        throw new Error(
            "Wallet not detected."
        );

    }

    const accounts =
        await window.ethereum.request({

            method:
                "eth_requestAccounts"

        });

    if (!accounts.length) {

        throw new Error(
            "No account selected."
        );

    }

    if (!(await checkNetwork())) {

        await switchNetwork();

    }

    await hydrateWallet(
        accounts[0]
    );

    localStorage.setItem(

        STORAGE.wallet,

        "connected"

    );

    return account;

}

export async function restoreConnection() {

    if (!hasWallet()) {

        updateWalletUI();

        return null;

    }

    const remember =
        localStorage.getItem(
            STORAGE.wallet
        );

    if (remember !== "connected") {

        updateWalletUI();

        return null;

    }

    const accounts =
        await window.ethereum.request({

            method:
                "eth_accounts"

        });

    if (!accounts.length) {

        clearWalletState();

        return null;

    }

    await hydrateWallet(
        accounts[0]
    );

    return account;

}
// =====================================================
// EVENTS
// =====================================================

function bindWalletEvents() {

    if (!hasWallet()) {

        return;

    }

    window.ethereum.on(

        "accountsChanged",

        async accounts => {

            try {

                if (!accounts.length) {

                    clearWalletState();

                    return;

                }

                await hydrateWallet(
                    accounts[0]
                );

            }

            catch (error) {

                console.error(error);

            }

        }

    );

    window.ethereum.on(

        "chainChanged",

        async () => {

            try {

                if (!account) {

                    return;

                }

                const network =
                    await window.ethereum.request({

                        method:
                            "eth_chainId"

                    });

                chainId =
                    Number(network);

                emitChainChanged(
                    chainId
                );

            }

            catch (error) {

                console.error(error);

            }

        }

    );

}

// =====================================================
// BUTTONS
// =====================================================

function bindConnectButtons() {

    document

        .querySelectorAll(
            "#connectWallet"
        )

        .forEach(button => {

            button.onclick =
                async () => {

                    if (account) {

                        return;

                    }

                    try {

                        await connectWallet();

                    }

                    catch (error) {

                        console.error(error);

                        alert(

                            error?.message ||

                            "Unable to connect wallet."

                        );

                    }

                };

        });

}

// =====================================================
// INITIALIZE
// =====================================================

export async function initializeWallet() {

    if (initialized) {

        return;

    }

    initialized = true;

    bindWalletEvents();

    bindConnectButtons();

    updateWalletUI();

    /*
    MODE B

    - Tidak auto connect untuk user baru
    - Akan restore hanya jika user
      pernah connect sebelumnya
    */

    try {

        await restoreConnection();

    }

    catch (error) {

        console.error(error);

    }

}
