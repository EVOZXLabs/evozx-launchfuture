import {
  symbolExists,
  getDeploymentFee
} from "./factory.js";

// ==========================
// ELEMENTS
// ==========================

const burnable = document.getElementById("burnable");
const mintable = document.getElementById("mintable");
const ownership = document.getElementById("ownership");

const featureFee = document.getElementById("featureFee");
const totalFee = document.getElementById("totalFee");
const burnAmount = document.getElementById("burnAmount");
const treasuryAmount = document.getElementById("treasuryAmount");

const tokenSymbol =
  document.getElementById("tokenSymbol") ||
  document.getElementById("symbolInput");

const symbolStatus = document.getElementById("symbolStatus");
const baseFeeEl = document.getElementById("baseFee");
const continueBtn = document.getElementById("continueBtn");

// ==========================
// STATE
// ==========================

let baseFeeValue = 10; // default aman
let isSymbolValid = false;
let isCheckingSymbol = false;

// ==========================
// SAFE TEXT SETTER
// ==========================

function setText(el, text) {
  if (el) el.textContent = text;
}

// ==========================
// FEE CALCULATOR
// ==========================

function calculate() {
  if (!featureFee || !totalFee) return;

  let feature = 0;

  if (burnable?.checked) feature += 5;
  if (mintable?.checked) feature += 10;
  if (ownership?.checked) feature += 5;

  const total = baseFeeValue + feature;

  setText(featureFee, `${feature} EVOZX`);
  setText(totalFee, `${total} EVOZX`);
  setText(burnAmount, `${(total * 0.3).toFixed(2)} EVOZX`);
  setText(treasuryAmount, `${(total * 0.7).toFixed(2)} EVOZX`);

  updateContinueState();
}

// ==========================
// LOAD BASE FEE (SAFE)
// ==========================

async function loadBaseFee() {
  try {
    setText(baseFeeEl, "Loading...");

    const feeData = await getDeploymentFee();

    if (!feeData || feeData.total == null) {
      throw new Error("Invalid feeData");
    }

    baseFeeValue = Number(feeData.total);

    if (isNaN(baseFeeValue)) {
      baseFeeValue = 10;
    }

    setText(baseFeeEl, `${baseFeeValue} EVOZX`);
  } catch (err) {
    console.error("BASE FEE ERROR:", err);

    baseFeeValue = 10;
    setText(baseFeeEl, "10 EVOZX (fallback)");
  }

  calculate();
}

// ==========================
// CONTINUE BUTTON STATE
// ==========================

function updateContinueState() {
  if (!continueBtn) return;

  const symbol = tokenSymbol?.value?.trim();

  const valid =
    symbol &&
    isSymbolValid &&
    !isCheckingSymbol;

  continueBtn.disabled = !valid;
  continueBtn.style.opacity = valid ? "1" : "0.5";
  continueBtn.style.cursor = valid ? "pointer" : "not-allowed";
}

// ==========================
// SYMBOL CHECKER (STABLE)
// ==========================

let symbolTimeout;

tokenSymbol?.addEventListener("input", () => {
  clearTimeout(symbolTimeout);

  const symbol = tokenSymbol.value.trim();

  isSymbolValid = false;

  if (!symbol) {
    setText(symbolStatus, "");
    updateContinueState();
    return;
  }

  setText(symbolStatus, "Checking...");
  symbolStatus.style.color = "black";

  isCheckingSymbol = true;
  updateContinueState();

  symbolTimeout = setTimeout(async () => {
    try {
      const exists = await symbolExists(symbol);

      if (exists) {
        isSymbolValid = false;
        setText(symbolStatus, "❌ Symbol already exists");
        symbolStatus.style.color = "red";
      } else {
        isSymbolValid = true;
        setText(symbolStatus, "✅ Symbol available");
        symbolStatus.style.color = "green";
      }
    } catch (err) {
      console.error("SYMBOL ERROR:", err);

      isSymbolValid = false;
      setText(symbolStatus, "⚠️ Error checking");
      symbolStatus.style.color = "orange";
    }

    isCheckingSymbol = false;
    updateContinueState();
  }, 600);
});

// ==========================
// EVENTS
// ==========================

burnable?.addEventListener("change", calculate);
mintable?.addEventListener("change", calculate);
ownership?.addEventListener("change", calculate);

// ==========================
// INIT
// ==========================

window.addEventListener("DOMContentLoaded", async () => {
  calculate();
  await loadBaseFee();
  updateContinueState();
});
