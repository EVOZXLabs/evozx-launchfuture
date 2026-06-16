import {

connectWallet,

restoreWallet,

getAccount,

onAccountChanged,

onChainChanged

} from "./wallet.js";

import {

getFactoryName,

getVersion,

getTotalTokens,

getOwner

} from "./factory.js";

import {

getExchangeRate

} from "./exchange.js";

// =====================================================
// ELEMENTS
// =====================================================

const connectButton =
document.getElementById(
"connectWallet"
);

const createButton =
document.getElementById(
"createButton"
);

const dashboardButton =
document.getElementById(
"dashboardButton"
);

const factoryNameElement =
document.getElementById(
"factoryName"
);

const versionElement =
document.getElementById(
"factoryVersion"
);

const totalTokensElement =
document.getElementById(
"totalTokens"
);

const ownerElement =
document.getElementById(
"factoryOwner"
);

const exchangeRateElement =
document.getElementById(
"exchangeRate"
);

// =====================================================
// HELPERS
// =====================================================

function shortAddress(address){

if(!address){

return "-";

}

return(

address.slice(0,6)+
"..." +
address.slice(-4)

);

}

function setButtonConnected(address){

if(!connectButton){

return;

}

connectButton.textContent=
shortAddress(address);

}

function setButtonDisconnected(){

if(!connectButton){

return;

}

connectButton.textContent=
"Connect Wallet";

}

// =====================================================
// LOAD FACTORY
// =====================================================

async function loadFactoryInfo(){

try{

const [

factoryName,

version,

totalTokens,

owner,

rate

]=await Promise.all([

getFactoryName(),

getVersion(),

getTotalTokens(),

getOwner(),

getExchangeRate()

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
totalTokens;

}

if(ownerElement){

ownerElement.textContent=
shortAddress(owner);

}

if(exchangeRateElement){

exchangeRateElement.textContent=
`1 EVOZX = ${rate} EVOZ`;

}

}

catch(error){

console.error(error);

}

}

// =====================================================
// CONNECT
// =====================================================

async function connect(){

try{

await connectWallet();

const account=
getAccount();

if(account){

setButtonConnected(account);

}

}

catch(error){

console.error(error);

}

}

// =====================================================
// EVENTS
// =====================================================

function bindEvents(){

if(connectButton){

connectButton.addEventListener(

"click",

connect

);

}

if(createButton){

createButton.addEventListener(

"click",

()=>{

location.href=
"./launch.html";

}

);

}

if(dashboardButton){

dashboardButton.addEventListener(

"click",

()=>{

location.href=
"./dashboard.html";

}

);

}

onAccountChanged(

(account)=>{

if(account){

setButtonConnected(account);

}

else{

setButtonDisconnected();

}

}

);

onChainChanged(

()=>{

location.reload();

}

);

}

// =====================================================
// INIT
// =====================================================

async function init(){

try{

await restoreWallet();

const account=
getAccount();

if(account){

setButtonConnected(account);

}

else{

setButtonDisconnected();

}

await loadFactoryInfo();

bindEvents();

}

catch(error){

console.error(error);

}

}

init();
