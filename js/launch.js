import {

  symbolExists

}
from "./factory.js";

const burnable =
document.getElementById(
  "burnable"
);

const mintable =
document.getElementById(
  "mintable"
);

const ownership =
document.getElementById(
  "ownership"
);

const featureFee =
document.getElementById(
  "featureFee"
);

const totalFee =
document.getElementById(
  "totalFee"
);

const burnAmount =
document.getElementById(
  "burnAmount"
);

const treasuryAmount =
document.getElementById(
  "treasuryAmount"
);

function calculate(){

  let fee = 10;

  if(burnable.checked)
    fee += 5;

  if(mintable.checked)
    fee += 10;

  if(ownership.checked)
    fee += 5;

  featureFee.textContent =
  `${fee - 10} EVOZX`;

  totalFee.textContent =
  `${fee} EVOZX`;

  burnAmount.textContent =
  `${(fee*0.30).toFixed(2)} EVOZX`;

  treasuryAmount.textContent =
  `${(fee*0.70).toFixed(2)} EVOZX`;

}

burnable.addEventListener(
  "change",
  calculate
);

mintable.addEventListener(
  "change",
  calculate
);

ownership.addEventListener(
  "change",
  calculate
);

const tokenSymbol =

document.getElementById(
  "tokenSymbol"
);

const symbolStatus =

document.getElementById(
  "symbolStatus"
);

calculate();

let symbolTimeout;

tokenSymbol?.addEventListener(

  "input",

  () => {

    clearTimeout(
      symbolTimeout
    );

    const symbol =
    tokenSymbol.value.trim();

    if (!symbol) {

      symbolStatus.textContent =
      "";

      return;
    }

    symbolTimeout =

    setTimeout(

      async () => {

        try {

          const exists =

          await symbolExists(
            symbol
          );

          if (exists) {

            symbolStatus.textContent =

            "Symbol already exists";

          } else {

            symbolStatus.textContent =

            "Symbol available";

          }

        } catch {

          symbolStatus.textContent =

          "";

        }

      },

      600

    );

  }

);
