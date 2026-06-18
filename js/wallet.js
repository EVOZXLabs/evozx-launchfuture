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

    return !!account;

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

    accountListeners.push(callback);

}

export function onChainChanged(callback) {

    if (typeof callback !== "function") {

        return;

    }

    chainListeners.push(callback);

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
// NETWORK
// =====================================================

export async function checkNetwork() {

    if (!hasWallet()) {

        return false;

    }

    const currentChainId =

        await window.ethereum.request({

            method: "eth_chainId"

        });

    return (

        Number(currentChainId) ===

        NETWORK.chainId

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

    return true;

}

// =====================================================
// CONNECTION
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

    provider =

        new BrowserProvider(

            window.ethereum

        );

    signer =

        await provider.getSigner();

    account =

        await signer.getAddress();

    const network =

        await provider.getNetwork();

    chainId =

        Number(network.chainId);

    if (!(await checkNetwork())) {

        await switchNetwork();

    }

    localStorage.setItem(

        STORAGE.wallet,

        "connected"

    );

    updateWalletButtons();

    emitAccountChanged(account);

    emitChainChanged(chainId);

    return account;

}

export async function restoreConnection() {

    if (

        localStorage.getItem(

            STORAGE.wallet

        ) !== "connected"

    ) {

        updateWalletButtons();

        return;

    }

    if (!hasWallet()) {

        return;

    }

    const accounts =

        await window.ethereum.request({

            method:
                "eth_accounts"

        });

    if (!accounts.length) {

        disconnectWallet();

        return;

    }

    provider =

        new BrowserProvider(

            window.ethereum

        );

    signer =

        await provider.getSigner();

    account =

        accounts[0];

    const network =

        await provider.getNetwork();

    chainId =

        Number(network.chainId);

    updateWalletButtons();

    emitAccountChanged(account);

    emitChainChanged(chainId);

}

export function disconnectWallet() {

    provider = null;

    signer = null;

    account = null;

    chainId = null;

    localStorage.removeItem(

        STORAGE.wallet

    );

    updateWalletButtons();

    emitAccountChanged(null);

}

// =====================================================
// UI
// =====================================================

export function updateWalletButtons() {

    document

        .querySelectorAll(

            "#connectWallet"

        )

        .forEach(button => {

            if (!button) {

                return;

            }

            if (account) {

                button.textContent =

                    shortAddress(account);

                button.dataset.connected =

                    "true";

            }

            else {

                button.textContent =

                    "Connect Wallet";

                button.dataset.connected =

                    "false";

            }

        });

}

// =====================================================
// CONNECT BUTTON
// =====================================================

function bindConnectButtons() {

    document

        .querySelectorAll(

            "#connectWallet"

        )

        .forEach(button => {

            button.addEventListener(

                "click",

                async () => {

                    try {

                        if (account) {

                            disconnectWallet();

                            return;

                        }

                        await connectWallet();

                    }

                    catch (error) {

                        console.error(error);

                        alert(

                            error.message ||

                            "Unable to connect wallet."

                        );

                    }

                }

            );

        });

}

// =====================================================
// WALLET EVENTS
// =====================================================

function bindWalletEvents() {

    if (!hasWallet()) {

        return;

    }

    window.ethereum.on(

        "accountsChanged",

        async accounts => {

            if (!accounts.length) {

                disconnectWallet();

                return;

            }

            provider =

                new BrowserProvider(

                    window.ethereum

                );

            signer =

                await provider.getSigner();

            account =

                accounts[0];

            updateWalletButtons();

            emitAccountChanged(account);

        }

    );

    window.ethereum.on(

        "chainChanged",

        async () => {

            try {

                provider =

                    new BrowserProvider(

                        window.ethereum

                    );

                const network =

                    await provider.getNetwork();

                chainId =

                    Number(network.chainId);

            }

            catch {

                chainId = null;

            }

            emitChainChanged(chainId);

        }

    );

}

// =====================================================
// INITIALIZE
// =====================================================

export async function initializeWallet() {

    bindWalletEvents();

    bindConnectButtons();

    await restoreConnection();

}

// =====================================================
// STARTUP
// =====================================================

document.addEventListener(

    "DOMContentLoaded",

    initializeWallet

);

// =====================================================
// EXPORTS
// =====================================================

export {

    initializeWallet

};
