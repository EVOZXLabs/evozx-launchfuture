import { BrowserProvider } from "https://esm.sh/ethers@6";

import {

    NETWORK,
    STORAGE

} from "./config.js";

// ============================================================
// STATE
// ============================================================

let provider = null;

let signer = null;

let account = null;

// ============================================================
// PROVIDER
// ============================================================

async function initProvider() {

    if (!window.ethereum) {

        throw new Error(
            "Wallet not detected."
        );

    }

    if (!provider) {

        provider =
            new BrowserProvider(
                window.ethereum
            );

    }

    return provider;

}

// ============================================================
// NETWORK
// ============================================================

export async function checkNetwork() {

    if (!window.ethereum) {

        return false;

    }

    const chainId =
        await window.ethereum.request({

            method:
                "eth_chainId"

        });

    return (
        chainId.toLowerCase() ===
        NETWORK.chainIdHex.toLowerCase()
    );

}

export async function switchToEVOZ() {

    if (!window.ethereum) {

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

    catch {

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

// ============================================================
// CONNECT
// ============================================================

export async function connectWallet() {

    await initProvider();

    const correctNetwork =
        await checkNetwork();

    if (!correctNetwork) {

        await switchToEVOZ();

    }

    await window.ethereum.request({

        method:
            "eth_requestAccounts"

    });

    signer =
        await provider.getSigner();

    account =
        await signer.getAddress();

    localStorage.setItem(

        STORAGE.wallet,

        "true"

    );

    updateWalletButtons();

    return account;

}

// ============================================================
// RESTORE
// ============================================================

export async function restoreConnection() {

    if (

        localStorage.getItem(

            STORAGE.wallet

        ) !== "true"

    ) {

        return null;

    }

    if (!window.ethereum) {

        return null;

    }

    await initProvider();

    const accounts =
        await window.ethereum.request({

            method:
                "eth_accounts"

        });

    if (!accounts.length) {

        disconnectWallet();

        return null;

    }

    signer =
        await provider.getSigner();

    account =
        accounts[0];

    updateWalletButtons();

    return account;

}

// ============================================================
// DISCONNECT
// ============================================================

export function disconnectWallet() {

    localStorage.removeItem(

        STORAGE.wallet

    );

    provider = null;

    signer = null;

    account = null;

    updateWalletButtons();

}

// ============================================================
// GETTERS
// ============================================================

export function getProvider() {

    return provider;

}

export function getSigner() {

    return signer;

}

export function getAccount() {

    return account;

}

export function isConnected() {

    return account !== null;

}

// ============================================================
// UI
// ============================================================

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

export function updateWalletButtons() {

    const buttons =

        document.querySelectorAll(

            "#connectBtn"

        );

    buttons.forEach((button) => {

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

// ============================================================
// EVENTS
// ============================================================

if (window.ethereum) {

    window.ethereum.on(

        "accountsChanged",

        async (accounts) => {

            if (!accounts.length) {

                disconnectWallet();

                return;

            }

            await initProvider();

            signer =
                await provider.getSigner();

            account =
                accounts[0];

            updateWalletButtons();

        }

    );

    window.ethereum.on(

        "chainChanged",

        () => {

            window.location.reload();

        }

    );

}

// ============================================================
// AUTO RESTORE
// ============================================================

window.addEventListener(

    "DOMContentLoaded",

    async () => {

        try {

            await restoreConnection();

        }

        catch (error) {

            console.error(error);

        }

    }

);
