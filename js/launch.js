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

calculate();
