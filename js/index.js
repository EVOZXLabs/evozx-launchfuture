import{

  connectWallet,

  restoreConnection,

  getAccount,

  shortAddress

}from"./wallet.js";

import{

  getFactoryName,

  getVersion,

  getTotalTokens,

  getOwner

}from"./factory.js";

import{

  EXCHANGE

}from"./config.js";

// =====================================================
// ELEMENTS
// =====================================================

const connectButton=

document.getElementById(

  "connectWallet"

);

const factoryNameElement=

document.getElementById(

  "factoryName"

);

const versionElement=

document.getElementById(

  "factoryVersion"

);

const totalTokensElement=

document.getElementById(

  "totalTokens"

);

const ownerElement=

document.getElementById(

  "factoryOwner"

);

const exchangeRateElement=

document.getElementById(

  "exchangeRate"

);

// =====================================================
// WALLET UI
// =====================================================

function updateWalletButton(){

  if(!connectButton){

    return;

  }

  const account=

    getAccount();

  connectButton.textContent=

    account

      ? shortAddress(account)

      : "Connect Wallet";

}

// =====================================================
// FACTORY INFO
// =====================================================

async function loadFactoryInfo(){

  try{

    const[

      factoryName,

      version,

      totalTokens,

      owner

    ]=await Promise.all([

      getFactoryName(),

      getVersion(),

      getTotalTokens(),

      getOwner()

    ]);

    if(factoryNameElement){

      factoryNameElement.textContent=

        factoryName;

    }

    if(versionElement){

      versionElement.textContent=

        version;

    }

    if(totalTokensElement){

      totalTokensElement.textContent=

        totalTokens.toLocaleString();

    }

    if(ownerElement){

      ownerElement.textContent=

        shortAddress(owner);

    }

    if(exchangeRateElement){

      exchangeRateElement.textContent=

        `1 EVOZX = ${EXCHANGE.evozPerEVOZX} EVOZ`;

    }

  }

  catch(error){

    console.error(error);

  }

}

// =====================================================
// CONNECT WALLET
// =====================================================

async function connect(){

  try{

    await connectWallet();

    updateWalletButton();

  }

  catch(error){

    console.error(error);

  }

}

// =====================================================
// INITIALIZATION
// =====================================================

async function initialize(){

  await restoreConnection();

  updateWalletButton();

  await loadFactoryInfo();

  if(connectButton){

    connectButton.addEventListener(

      "click",

      connect

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
