import { Contract } from "https://esm.sh/ethers@6";

import {
  CONTRACTS,
  ABI,
  explorerToken
} from "./config.js";

import {
  getReadProvider
} from "./factory.js";

import {
  getAccount,
  restoreConnection
} from "./wallet.js";

// ======================================================
// STATE
// ======================================================

let tokenAbi = null;
let tokenCache = [];

// ======================================================
// DOM
// ======================================================

const tokenList =
  document.getElementById("tokenList");

const tokenCount =
  document.getElementById("tokenCount");

// ======================================================
// HELPERS
// ======================================================

function setTokenCount(value) {

  if (!tokenCount) {
    return;
  }

  tokenCount.textContent = String(value);

}

function shortAddress(address) {

  if (!address) {
    return "";
  }

  return (
    address.slice(0, 6) +
    "..." +
    address.slice(-4)
  );

}

async function loadTokenAbi() {

  if (tokenAbi) {
    return tokenAbi;
  }

  const response =
    await fetch("./abi/token.json");

  if (!response.ok) {
    throw new Error("Unable to load token ABI.");
  }

  tokenAbi =
    await response.json();

  return tokenAbi;

}

async function createTokenContract(address) {

  const abi =
    await loadTokenAbi();

  return new Contract(

    address,

    abi,

    getReadProvider()

  );

}

// ======================================================
// EMPTY STATE
// ======================================================

function renderEmpty(message =
  "No tokens found.") {

  if (!tokenList) {
    return;
  }

  tokenList.innerHTML = `

<div class="empty-state">

<h3>No Tokens</h3>

<p>${message}</p>

</div>

`;

  setTokenCount(0);

}

// ======================================================
// LOADING
// ======================================================

function renderLoading() {

  if (!tokenList) {
    return;
  }

  tokenList.innerHTML = `

<div class="loading-card">

Loading tokens...

</div>

`;

}

// ======================================================
// TOKEN INFO
// ======================================================

async function loadTokenInfo(address) {

  const token =
    await createTokenContract(address);

  const [

    name,
    symbol,
    supply

  ] = await Promise.all([

    token.name(),
    token.symbol(),
    token.totalSupply()

  ]);

  return {

    address,
    name,
    symbol,
    supply

  };

}

// ======================================================
// TOKEN CARD
// ======================================================

function buildCard(token) {

  return `

<div class="token-card">

  <div class="token-header">

    <h3>${token.name}</h3>

    <span class="badge">
      ${token.symbol}
    </span>

  </div>

  <div class="token-body">

    <p>

      <strong>Supply</strong><br>

      ${token.supply.toLocaleString()}

    </p>

    <p>

      <strong>Address</strong><br>

      ${shortAddress(token.address)}

    </p>

  </div>

  <div class="token-actions">

    <button
      class="secondary-button"
      data-copy="${token.address}"
    >
      Copy
    </button>

    <button
      class="secondary-button"
      data-explorer="${token.address}"
    >
      Explorer
    </button>

    <button
      class="primary-button"
      data-details="${token.address}"
    >
      Details
    </button>

  </div>

</div>

`;

}

// ======================================================
// BUTTON EVENTS
// ======================================================

function bindButtons() {

  document

    .querySelectorAll("[data-copy]")

    .forEach(button => {

      button.onclick = async () => {

        try {

          await navigator.clipboard.writeText(

            button.dataset.copy

          );

        }

        catch (error) {

          console.error(error);

        }

      };

    });

  document

    .querySelectorAll("[data-explorer]")

    .forEach(button => {

      button.onclick = () => {

        window.open(

          explorerToken(

            button.dataset.explorer

          ),

          "_blank"

        );

      };

    });

  document

    .querySelectorAll("[data-details]")

    .forEach(button => {

      button.onclick = () => {

        location.href =

          `./token.html?address=${button.dataset.details}`;

      };

    });

      }

// ======================================================
// LOAD TOKENS
// ======================================================

async function loadTokens() {

  await restoreConnection();

  const account =

    getAccount();

  if (!account) {

    renderEmpty(

      "Connect your wallet to view your deployed tokens."

    );

    return;

  }

  try {

    const factory =

      await createTokenContract(

        CONTRACTS.factory

      );

    const addresses =

      await factory.getTokensByCreator(

        account

      );

    if (addresses.length === 0) {

      renderEmpty(

        "This wallet has not deployed any token."

      );

      return;

    }

    tokenCache = [];

    renderLoading();

    for (const address of addresses) {

      try {

        const token =

          await loadTokenInfo(

            address

          );

        tokenCache.push({

          ...token,

          supply: Number(

            formatUnits(

              token.supply,

              18

            )

          )

        });

      }

      catch (error) {

        console.error(

          address,

          error

        );

      }

    }

    tokenCache.sort(

      (a,b)=>

        a.name.localeCompare(

          b.name

        )

    );

    tokenList.innerHTML =

      tokenCache

        .map(buildCard)

        .join("");

    setTokenCount(

      tokenCache.length

    );

    bindButtons();

  }

  catch (error) {

    console.error(error);

    renderEmpty(

      "Unable to load token list."

    );

  }

}

// ======================================================
// INITIALIZATION
// ======================================================

async function initialize() {

  try {

    await loadTokens();

  }

  catch (error) {

    console.error(error);

    renderEmpty(

      "Unexpected error."

    );

  }

}

document.addEventListener(

  "DOMContentLoaded",

  initialize

);

// ======================================================
// EXPORTS
// ======================================================

export {

  loadTokens

};
