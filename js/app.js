import {
  connectWallet,
  switchToEVOZ
}
from "./wallet.js";

import {
  CONTRACTS,
  LINKS
}
from "./config.js";

const connectBtn =
document.getElementById(
  "connectBtn"
);

const addNetworkBtn =
document.getElementById(
  "addNetworkBtn"
);

function shortAddress(addr){

  return `${addr.slice(0,6)}
  ...
  ${addr.slice(-4)}`;

}

async function handleConnect(){

  try{

    connectBtn.disabled = true;

    connectBtn.textContent =
    "Connecting...";

    await switchToEVOZ();

    const wallet =
    await connectWallet();

    connectBtn.textContent =
    shortAddress(
      wallet.address
    );

  }catch(error){

    console.error(error);

    alert(
      error.message ||
      "Wallet connection failed."
    );

    connectBtn.textContent =
    "Connect Wallet";

  }finally{

    connectBtn.disabled = false;

  }

}

async function handleAddNetwork(){

  try{

    await switchToEVOZ();

  }catch(error){

    console.error(error);

  }

}

function setupWalletEvents(){

  if(!window.ethereum) return;

  window.ethereum.on(

    "accountsChanged",

    () => {

      window.location.reload();

    }

  );

  window.ethereum.on(

    "chainChanged",

    () => {

      window.location.reload();

    }

  );

}

function setupExplorerLinks(){

  document
  .querySelectorAll(
    "[data-address]"
  )
  .forEach(el => {

    const address =
    el.dataset.address;

    el.href =
    LINKS.ADDRESS + address;

  });

}

function init(){

  connectBtn?.addEventListener(

    "click",

    handleConnect

  );

  addNetworkBtn?.addEventListener(

    "click",

    handleAddNetwork

  );

  setupWalletEvents();

  setupExplorerLinks();

}

init();
