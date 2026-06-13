import {
  symbolExists,
  getDeploymentFee
} from "./factory.js";

import { formatEther } from "https://esm.sh/ethers@6";

// ==========================
// ELEMENTS
// ==========================

const burnable =
document.getElementById("burnable");

const mintable =
document.getElementById("mintable");

const ownership =
document.getElementById("ownership");

const featureFee =
document.getElementById("featureFee");

const totalFee =
document.getElementById("totalFee");

const burnAmount =
document.getElementById("burnAmount");

const treasuryAmount =
document.getElementById("treasuryAmount");

const tokenSymbol =
document.getElementById("symbolInput");

const symbolStatus =
document.getElementById("symbolStatus");

const baseFeeEl =
document.getElementById("baseFee");

const continueBtn =
document.getElementById("continueBtn");

// ==========================
// STATE
// ==========================

let baseFeeValue = 0;
let isSymbolValid = false;

// ==========================
// FEE CALCULATOR
// ==========================

function calculate() {

  if (
    !featureFee ||
    !totalFee ||
    !burnAmount ||
    !treasuryAmount
  ) return;

  const baseFee = baseFeeValue;

  let feature = 0;

  if (burnable?.checked) feature += 5;
  if (mintable?.checked) feature += 10;
  if (ownership?.checked) feature += 5;

  const total = baseFee + feature;

  featureFee.textContent =
    `${feature} EVOZX`;

  totalFee.textContent =
    `${total} EVOZX`;

  burnAmount.textContent =
    `${(total * 0.30).toFixed(2)} EVOZX`;

  treasuryAmount.textContent =
    `${(total * 0.70).toFixed(2)} EVOZX`;
}

// ==========================
// EVENT LISTENERS
// ==========================

burnable?.addEventListener("change", calculate);
mintable?.addEventListener("change", calculate);
ownership?.addEventListener("change", calculate);

// ==========================
// LOAD BASE FEE (CONTRACT)
// ==========================

async function loadBaseFee() {

  try {

    if (!baseFeeEl) return;

    baseFeeEl.textContent = "Loading...";

    const fee =
      await getDeploymentFee();

    if (!fee) {

      baseFeeEl.textContent = "Failed";
      return;
    }

    baseFeeValue =
      Number(formatEther(fee));

    baseFeeEl.textContent =
      `${baseFeeValue} EVOZX`;

    calculate();

  } catch (error) {

    console.error(error);

    if (baseFeeEl)
      baseFeeEl.textContent = "Error";
  }
}

// ==========================
// SYMBOL CHECKER (LIVE)
// ==========================

function updateContinueState() {

  if (!continueBtn) return;

  const symbol =
    tokenSymbol?.value.trim();

  if (!symbol || !isSymbolValid) {

    continueBtn.disabled = true;
    continueBtn.style.opacity = "0.5";
    continueBtn.style.cursor = "not-allowed";

  } else {

    continueBtn.disabled = false;
    continueBtn.style.opacity = "1";
    continueBtn.style.cursor = "pointer";
  }
}

let symbolTimeout;

tokenSymbol?.addEventListener("input", () => {

  clearTimeout(symbolTimeout);

  const symbol =
    tokenSymbol.value.trim();

  if (!symbol) {

    if (symbolStatus)
      symbolStatus.textContent = "";

    return;
  }

  if (symbolStatus) {

    symbolStatus.textContent = "Checking...";
    symbolStatus.style.color = "black";
  }

  symbolTimeout = setTimeout(async () => {

    try {

      const exists =
  await symbolExists(symbol);

if (!symbolStatus) return;

if (exists) {

  isSymbolValid = false;

  symbolStatus.textContent =
    "❌ Symbol already exists";

  symbolStatus.style.color = "red";

} else {

  isSymbolValid = true;

  symbolStatus.textContent =
    "✅ Symbol available";

  symbolStatus.style.color = "green";
}

updateContinueState();
    }

  }, 500);

});

// ==========================
// INIT
// ==========================

calculate();

window.addEventListener("DOMContentLoaded", () => {
  loadBaseFee();
});
