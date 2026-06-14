import { LINKS } from "./config.js";

// =====================================
// ELEMENTS
// =====================================

const tokenAddressEl =
  document.getElementById("tokenAddress");

const tokenNameEl =
  document.getElementById("tokenName");

const tokenSymbolEl =
  document.getElementById("tokenSymbol");

const tokenSupplyEl =
  document.getElementById("tokenSupply");

const creatorEl =
  document.getElementById("creator");

const txHashEl =
  document.getElementById("txHash");

const explorerBtn =
  document.getElementById("explorerBtn");

const copyAddressBtn =
  document.getElementById("copyAddressBtn");

const copyTxBtn =
  document.getElementById("copyTxBtn");

// =====================================
// HELPERS
// =====================================

function setText(el, value) {

  if (!el) return;

  el.textContent = value ?? "-";
}

function shortAddress(address) {

  if (!address) return "-";

  return (
    address.slice(0, 6) +
    "..." +
    address.slice(-4)
  );
}

async function copyText(text) {

  if (!text) return;

  try {

    await navigator.clipboard.writeText(
      text
    );

    alert("Copied");

  } catch (error) {

    console.error(
      "Copy error:",
      error
    );
  }
}

// =====================================
// LOAD DATA
// =====================================

function getLastToken() {

  try {

    const raw =
      localStorage.getItem(
        "lastDeployedToken"
      );

    if (!raw) {
      return null;
    }

    return JSON.parse(raw);

  } catch (error) {

    console.error(
      "Load token error:",
      error
    );

    return null;
  }
}

// =====================================
// RENDER
// =====================================

function renderSuccess() {

  const token =
    getLastToken();

  if (!token) {

    setText(
      tokenAddressEl,
      "No deployment data found"
    );

    return;
  }

  setText(
    tokenNameEl,
    token.name
  );

  setText(
    tokenSymbolEl,
    token.symbol
  );

  setText(
    tokenSupplyEl,
    token.supply
  );

  setText(
    creatorEl,
    shortAddress(
      token.creator
    )
  );

  setText(
    tokenAddressEl,
    token.token ||
    "Pending"
  );

  setText(
    txHashEl,
    shortAddress(
      token.txHash
    )
  );

  // ==========================
  // EXPLORER BUTTON
  // ==========================

  explorerBtn?.addEventListener(
    "click",
    () => {

      if (!token.txHash)
        return;

      window.open(
        LINKS.TX +
        token.txHash,
        "_blank"
      );
    }
  );

  // ==========================
  // COPY ADDRESS
  // ==========================

  copyAddressBtn?.addEventListener(
    "click",
    () => {

      copyText(
        token.token
      );
    }
  );

  // ==========================
  // COPY TX
  // ==========================

  copyTxBtn?.addEventListener(
    "click",
    () => {

      copyText(
        token.txHash
      );
    }
  );
}

// =====================================
// INIT
// =====================================

window.addEventListener(
  "DOMContentLoaded",
  renderSuccess
);
