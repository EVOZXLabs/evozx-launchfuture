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

    const factory =
      await getFactory();

    const base =
      await factory.BASE_FEE();

    const multiplier =
      await factory.feeMultiplier();

    const baseNum =
      Number(formatEther(base || 0));

    const multiNum =
      Number(multiplier || 1);

    baseFeeValue =
      baseNum * multiNum;

    baseFeeEl.textContent =
      `${baseFeeValue} EVOZX`;

    calculate();

  } catch (error) {

    console.error("BASE_FEE ERROR:", error);

    baseFeeValue = 10; // fallback biar UI hidup

    if (baseFeeEl)
      baseFeeEl.textContent =
        "10 EVOZX (fallback)";

    calculate();
  }
}

// ==========================
// CONTINUE BUTTON STATE
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

// ==========================
// SYMBOL CHECKER (LIVE)
// ==========================

let symbolTimeout;

tokenSymbol?.addEventListener("input", () => {

  clearTimeout(symbolTimeout);

  const symbol =
    tokenSymbol.value.trim();

  // EMPTY INPUT
  if (!symbol) {

    isSymbolValid = false;

    if (symbolStatus) {
      symbolStatus.textContent = "";
      symbolStatus.style.color = "";
    }

    updateContinueState();

    return;
  }

  // CHECKING STATE
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

    } catch (error) {

      console.error(error);

      isSymbolValid = false;

      if (symbolStatus) {
        symbolStatus.textContent = "";
        symbolStatus.style.color = "";
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
