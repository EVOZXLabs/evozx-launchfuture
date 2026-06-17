import {

  formatUnits

} from "https://esm.sh/ethers@6";

import {

  getDeploymentFee,
  getDeploymentPreview

} from "./factory.js";

import {

  calculateEVOZNeeded

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
  restoreConnection

} from "./wallet.js";

// =====================================================
// DOM
// =====================================================

const $ = (id)=>

  document.getElementById(id);

function text(id,value){

  const element = $(id);

  if(element){

    element.textContent = value;

  }

}

function html(id,value){

  const element = $(id);

  if(element){

    element.innerHTML = value;

  }

}

function enable(id,state=true){

  const element = $(id);

  if(element){

    element.disabled = !state;

  }

}

function value(id){

  const element = $(id);

  return element

    ? element.value.trim()

    : "";

}

function checked(id){

  const element = $(id);

  return element

    ? element.checked

    : false;

}

// =====================================================
// STATE
// =====================================================

let deploymentFee = 0n;

let deployRunning = false;

let symbolTimer = null;

// =====================================================
// BUILD FORM
// =====================================================

function getFormData(){

  return{

    name:

      value("name"),

    symbol:

      value("symbol"),

    supply:

      Number(

        value("supply")

      ),

    burnable:

      checked("burnable"),

    mintable:

      checked("mintable"),

    ownershipEnabled:

      checked("ownership"),

    website:

      value("website"),

    telegram:

      value("telegram"),

    twitter:

      value("twitter"),

    logoURI:

      value("logoURI"),

    maxWalletEnabled:

      checked("maxWalletEnabled"),

    maxWalletPercent:

      Number(

        value("maxWalletPercent")

      )||0,

    maxTxEnabled:

      checked("maxTxEnabled"),

    maxTxPercent:

      Number(

        value("maxTxPercent")

      )||0,

    tradingControlEnabled:

      checked(

        "tradingControlEnabled"

      ),

    tradingEnabled:

      checked(

        "tradingEnabled"

      ),

    buyTaxEnabled:

      checked("buyTaxEnabled"),

    buyTax:

      Number(

        value("buyTax")

      )||0,

    sellTaxEnabled:

      checked("sellTaxEnabled"),

    sellTax:

      Number(

        value("sellTax")

      )||0,

    burnTaxShare:

      Number(

        value("burnTaxShare")

      )||0,

    marketingWallet:

      value("marketingWallet"),

    developmentWallet:

      value("developmentWallet")

  };

}

// =====================================================
// STATUS
// =====================================================

function setStatus(message=""){

  text(

    "statusText",

    message

  );

}

function clearStatus(){

  setStatus("");

}

// =====================================================
// ACCORDION
// =====================================================

function initializeAccordion(){

  document

    .querySelectorAll(".accordion")

    .forEach(item=>{

      const header =

        item.querySelector(

          ".accordion-header"

        );

      if(!header){

        return;

      }

      header.addEventListener(

        "click",

        ()=>{

          item.classList.toggle(

            "open"

          );

        }

      );

    });

}

// =====================================================
// FEATURE STATE
// =====================================================

function updateFeatureState(){

  enable(

    "maxWalletPercent",

    checked(

      "maxWalletEnabled"

    )

  );

  enable(

    "maxTxPercent",

    checked(

      "maxTxEnabled"

    )

  );

  enable(

    "tradingEnabled",

    checked(

      "tradingControlEnabled"

    )

  );

  const taxEnabled =

    checked("buyTaxEnabled") ||

    checked("sellTaxEnabled");

  enable(

    "buyTax",

    checked(

      "buyTaxEnabled"

    )

  );

  enable(

    "sellTax",

    checked(

      "sellTaxEnabled"

    )

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
// SYMBOL
// =====================================================

async function updateSymbolStatus(){

  const badge =

    $("symbolStatus");

  if(!badge){

    return;

  }

  const symbol =

    value("symbol");

  if(!symbol){

    badge.textContent="";

    badge.className="";

    return;

  }

  try{

    const result =

      await checkSymbol(

        symbol

      );

    if(result.exists){

      badge.textContent=

        "Already Used";

      badge.className=

        "badge badge-red";

    }

    else{

      badge.textContent=

        "Available";

      badge.className=

        "badge badge-green";

    }

  }

  catch{

    badge.textContent=

      "";

    badge.className=

      "";

  }

}

function scheduleSymbolCheck(){

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

function validateForm(){

  const error =

    validateConfig(

      getFormData()

    );

  if(error){

    setStatus(error);

    return false;

  }

  clearStatus();

  return true;

}

// =====================================================
// EVENTS
// =====================================================

function bindEvents(){

  document

    .querySelectorAll(

      "input,textarea,select"

    )

    .forEach(element=>{

      element.addEventListener(

        "input",

        async()=>{

          updateFeatureState();

          validateForm();

          scheduleSymbolCheck();

          await refreshPreview();

        }

      );

      element.addEventListener(

        "change",

        async()=>{

          updateFeatureState();

          validateForm();

          scheduleSymbolCheck();

          await refreshPreview();

        }

      );

    });

          }

// =====================================================
// DEPLOY BUTTON
// =====================================================

function setDeployLoading(state){

  deployRunning = state;

  const button = $("deployButton");

  if(!button){

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
// PREVIEW
// =====================================================

async function refreshPreview(){

  try{

    if(!validateForm()){

      return;

    }

    const account =

      getAccount();

    if(!account){

      return;

    }

    const form =

      getFormData();

    const fee =

      await getDeploymentFee(

        form

      );

    deploymentFee = fee;

    text(

      "deploymentFee",

      `${formatUnits(fee,18)} EVOZX`

    );

    const preview =

      await getDeploymentPreview(

        form,

        account

      );

    text(

      "evozxBalance",

      formatUnits(

        preview.balance,

        18

      )

    );

    const missing =

      preview.balance >= preview.fee

        ? 0n

        : preview.fee -

          preview.balance;

    text(

      "missingEVOZX",

      formatUnits(

        missing,

        18

      )

    );

    const requiredEVOZ =

      await calculateEVOZNeeded(

        missing

      );

    text(

      "neededEVOZ",

      formatUnits(

        requiredEVOZ,

        18

      )

    );

    text(

      "readyStatus",

      preview.enoughBalance

        ? "Ready to Deploy"

        : "Automatic EVOZX Top-up Required"

    );

  }

  catch(error){

    console.error(error);

    setStatus(

      error.message

    );

  }

}

// =====================================================
// DEPLOY
// =====================================================

async function onDeploy(){

  if(deployRunning){

    return;

  }

  try{

    if(!validateForm()){

      return;

    }

    setDeployLoading(true);

    await deployToken(

      getFormData()

    );

  }

  catch(error){

    console.error(error);

    setStatus(

      error.message ||

      "Deployment failed."

    );

  }

  finally{

    setDeployLoading(false);

  }

}

// =====================================================
// INITIALIZATION
// =====================================================

async function initialize(){

  try{

    await restoreConnection();

  }

  catch(error){

    console.error(error);

  }

  initializeAccordion();

  updateFeatureState();

  bindEvents();

  await updateSymbolStatus();

  await refreshPreview();

  const deployButton =

    $("deployButton");

  if(deployButton){

    deployButton.addEventListener(

      "click",

      onDeploy

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

export{

  refreshPreview,

  onDeploy

};
