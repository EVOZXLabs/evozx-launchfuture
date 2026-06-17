import {

  BrowserProvider

} from "https://esm.sh/ethers@6";

import {

  NETWORK,
  STORAGE

} from "./config.js";

let provider = null;

let signer = null;

let account = null;

// =====================================================
// STATE
// =====================================================

function hasWallet(){

  return typeof window.ethereum !== "undefined";

}

export function getProvider(){

  return provider;

}

export function getSigner(){

  return signer;

}

export function getAccount(){

  return account;

}

export function isConnected(){

  return account !== null;

}

export function shortAddress(address){

  if(!address){

    return "";

  }

  return `${

    address.slice(0,6)

  }...${

    address.slice(-4)

  }`;

}

// =====================================================
// NETWORK
// =====================================================

export async function checkNetwork(){

  if(!hasWallet()){

    return false;

  }

  const chainId =

    await window.ethereum.request({

      method:"eth_chainId"

    });

  return (

    Number(chainId) ===

    NETWORK.chainId

  );

}

export async function switchToEVOZ(){

  if(!hasWallet()){

    throw new Error(

      "Web3 wallet not detected."

    );

  }

  try{

    await window.ethereum.request({

      method:"wallet_switchEthereumChain",

      params:[{

        chainId:

          NETWORK.chainIdHex

      }]

    });

    return true;

  }

  catch(error){

    if(error.code !== 4902){

      throw error;

    }

    await window.ethereum.request({

      method:"wallet_addEthereumChain",

      params:[{

        chainId:

          NETWORK.chainIdHex,

        chainName:

          NETWORK.name,

        nativeCurrency:{

          name:

            NETWORK.symbol,

          symbol:

            NETWORK.symbol,

          decimals:

            NETWORK.decimals

        },

        rpcUrls:[

          NETWORK.rpcUrl

        ],

        blockExplorerUrls:[

          NETWORK.explorer

        ]

      }]

    });

    return true;

  }

}

// =====================================================
// CONNECTION
// =====================================================

export async function connectWallet(){

  if(!hasWallet()){

    throw new Error(

      "Web3 wallet not detected."

    );

  }

  if(!(await checkNetwork())){

    await switchToEVOZ();

  }

  await window.ethereum.request({

    method:"eth_requestAccounts"

  });

  provider = new BrowserProvider(

    window.ethereum

  );

  signer = await provider.getSigner();

  account = await signer.getAddress();

  localStorage.setItem(

    STORAGE.wallet,

    "true"

  );

  updateWalletButtons();

  return account;

}

export async function restoreConnection(){

  if(

    localStorage.getItem(

      STORAGE.wallet

    ) !== "true"

  ){

    updateWalletButtons();

    return;

  }

  if(!hasWallet()){

    updateWalletButtons();

    return;

  }

  const accounts =

    await window.ethereum.request({

      method:"eth_accounts"

    });

  if(accounts.length===0){

    disconnectWallet();

    return;

  }

  if(!(await checkNetwork())){

    disconnectWallet();

    return;

  }

  provider = new BrowserProvider(

    window.ethereum

  );

  signer = await provider.getSigner();

  account = accounts[0];

  updateWalletButtons();

}

export function disconnectWallet(){

  provider = null;

  signer = null;

  account = null;

  localStorage.removeItem(

    STORAGE.wallet

  );

  updateWalletButtons();

}

// =====================================================
// UI
// =====================================================

export function updateWalletButtons(){

  const buttons = document.querySelectorAll(

    "#connectWallet"

  );

  buttons.forEach(button=>{

    if(account){

      button.textContent =

        shortAddress(account);

      button.dataset.connected =

        "true";

    }

    else{

      button.textContent =

        "Connect Wallet";

      button.dataset.connected =

        "false";

    }

  });

}

// =====================================================
// EVENTS
// =====================================================

window.addEventListener(

  "DOMContentLoaded",

  ()=>{

    restoreConnection();

  }

);

if(typeof window.ethereum !== "undefined"){

  window.ethereum.on(

    "accountsChanged",

    async(accounts)=>{

      if(accounts.length===0){

        disconnectWallet();

        return;

      }

      provider = new BrowserProvider(

        window.ethereum

      );

      signer = await provider.getSigner();

      account = accounts[0];

      localStorage.setItem(

        STORAGE.wallet,

        "true"

      );

      updateWalletButtons();

    }

  );

  window.ethereum.on(

    "chainChanged",

    ()=>{

      window.location.reload();

    }

  );

    }
