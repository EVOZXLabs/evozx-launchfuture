import {
symbolExists
} from "./factory.js";

import {
FEES
} from "./config.js";

// =====================================================
// ELEMENTS
// =====================================================

const tokenName =
document.getElementById("tokenName");

const tokenSupply =
document.getElementById("tokenSupply");

const tokenSymbol =
document.getElementById("tokenSymbol") ||
document.getElementById("symbolInput");

const burnable =
document.getElementById("burnable");

const mintable =
document.getElementById("mintable");

const ownership =
document.getElementById("ownership");

const maxWallet =
document.getElementById("maxWalletEnabled");

const maxTx =
document.getElementById("maxTxEnabled");

const tradingControl =
document.getElementById("tradingControlEnabled");

const buyTax =
document.getElementById("buyTaxEnabled");

const sellTax =
document.getElementById("sellTaxEnabled");

const website =
document.getElementById("website");

const telegram =
document.getElementById("telegram");

const twitter =
document.getElementById("twitter");

const logoURI =
document.getElementById("logoURI");

const featureFee =
document.getElementById("featureFee");

const totalFee =
document.getElementById("totalFee");

const burnAmount =
document.getElementById("burnAmount");

const treasuryAmount =
document.getElementById("treasuryAmount");

const baseFeeEl =
document.getElementById("baseFee");

const symbolStatus =
document.getElementById("symbolStatus");

const continueBtn =
document.getElementById("continueBtn");

// =====================================================
// STATE
// =====================================================

let baseFeeValue =
FEES.BASE;

let isSymbolValid =
false;

let isCheckingSymbol =
false;

// =====================================================
// HELPERS
// =====================================================

function setText(
element,
value
) {
if (element) {
element.textContent =
value;
}
}

function isChecked(
element
) {
return !!element?.checked;
}

// =====================================================
// FEE ENGINE
// =====================================================

function calculate() {

let feature = 0;

if (
isChecked(
burnable
)
) {
feature +=
FEES.BURNABLE;
}

if (
isChecked(
mintable
)
) {
feature +=
FEES.MINTABLE;
}

if (
isChecked(
ownership
)
) {
feature +=
FEES.OWNERSHIP;
}

if (
isChecked(
maxWallet
)
) {
feature +=
FEES.MAX_WALLET;
}

if (
isChecked(
maxTx
)
) {
feature +=
FEES.MAX_TX;
}

if (
isChecked(
tradingControl
)
) {
feature +=
FEES.TRADING_CONTROL;
}

if (
isChecked(
buyTax
)
) {
feature +=
FEES.BUY_TAX;
}

if (
isChecked(
sellTax
)
) {
feature +=
FEES.SELL_TAX;
}

if (
website?.value?.trim()
) {
feature +=
FEES.WEBSITE;
}

if (
telegram?.value?.trim()
) {
feature +=
FEES.TELEGRAM;
}

if (
twitter?.value?.trim()
) {
feature +=
FEES.TWITTER;
}

if (
logoURI?.value?.trim()
) {
feature +=
FEES.LOGO;
}

const total =
baseFeeValue +
feature;

setText(
baseFeeEl,
"${baseFeeValue} EVOZX"
);

setText(
featureFee,
"${feature} EVOZX"
);

setText(
totalFee,
"${total} EVOZX"
);

setText(
burnAmount,
"${( total * 0.30 ).toFixed(2)} EVOZX"
);

setText(
treasuryAmount,
"${( total * 0.70 ).toFixed(2)} EVOZX"
);

updateContinueState();
}

// =====================================================
// CONTINUE BUTTON
// =====================================================

function updateContinueState() {

if (
!continueBtn
) {
return;
}

const nameValid =
tokenName?.value
?.trim()
?.length >= 2;

const symbolValid =
tokenSymbol?.value
?.trim()
?.length >= 2 &&
isSymbolValid;

const supplyValid =
Number(
tokenSupply?.value
) > 0;

const valid =
nameValid &&
symbolValid &&
supplyValid &&
!isCheckingSymbol;

continueBtn.disabled =
!valid;

continueBtn.style.opacity =
valid
? "1"
: "0.5";

continueBtn.style.cursor =
valid
? "pointer"
: "not-allowed";
}

// =====================================================
// SYMBOL CHECK
// =====================================================

let symbolTimeout;

tokenSymbol?.addEventListener(
"input",
() => {

clearTimeout(
  symbolTimeout
);

const symbol =
  tokenSymbol.value.trim();

isSymbolValid =
  false;

if (!symbol) {

  setText(
    symbolStatus,
    ""
  );

  updateContinueState();

  return;
}

setText(
  symbolStatus,
  "Checking..."
);

symbolStatus.style.color =
  "#999";

isCheckingSymbol =
  true;

updateContinueState();

symbolTimeout =
  setTimeout(
    async () => {

      try {

        const exists =
          await symbolExists(
            symbol
          );

        if (
          exists
        ) {

          isSymbolValid =
            false;

          setText(
            symbolStatus,
            "❌ Symbol already exists"
          );

          symbolStatus.style.color =
            "#ff4d4f";

        } else {

          isSymbolValid =
            true;

          setText(
            symbolStatus,
            "✅ Symbol available"
          );

          symbolStatus.style.color =
            "#52c41a";
        }

      } catch (
        error
      ) {

        console.error(
          error
        );

        isSymbolValid =
          false;

        setText(
          symbolStatus,
          "⚠️ Unable to check symbol"
        );

        symbolStatus.style.color =
          "#faad14";
      }

      isCheckingSymbol =
        false;

      updateContinueState();

    },
    600
  );

}
);

// =====================================================
// EVENTS
// =====================================================

[
burnable,
mintable,
ownership,
maxWallet,
maxTx,
tradingControl,
buyTax,
sellTax
].forEach(
element => {
element?.addEventListener(
"change",
calculate
);
}
);

[
tokenName,
tokenSupply,
website,
telegram,
twitter,
logoURI
].forEach(
element => {
element?.addEventListener(
"input",
calculate
);
}
);

// =====================================================
// INIT
// =====================================================

window.addEventListener(
"DOMContentLoaded",
() => {

calculate();

updateContinueState();

}
);
