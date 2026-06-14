import {
Contract,
formatEther
} from "https://esm.sh/ethers@6";

import {
getFactoryForWrite,
getDeploymentFee
} from "./factory.js";

import {
autoTopupEVOZX
} from "./exchange.js";

import {
CONTRACTS
} from "./config.js";

import {
getSigner
} from "./wallet.js";

// =====================================================
// ELEMENTS
// =====================================================

const continueBtn =
document.getElementById(
"continueBtn"
);

const tokenName =
document.getElementById(
"tokenName"
);

const tokenSymbol =
document.getElementById(
"tokenSymbol"
) ||
document.getElementById(
"symbolInput"
);

const tokenSupply =
document.getElementById(
"tokenSupply"
);

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

// =====================================================
// STATE
// =====================================================

let isDeploying = false;

// =====================================================
// EVOZX ABI
// =====================================================

const EVOZX_ABI = [

"function balanceOf(address) view returns (uint256)",

"function allowance(address,address) view returns (uint256)",

"function approve(address,uint256) returns (bool)"

];

// =====================================================
// VALIDATION
// =====================================================

function validateInput() {

const name =
tokenName?.value?.trim();

const symbol =
tokenSymbol?.value?.trim();

const supply =
tokenSupply?.value;

if (!name) {
return "Token name required";
}

if (!symbol) {
return "Token symbol required";
}

if (
!supply ||
isNaN(supply) ||
Number(supply) <= 0
) {
return "Invalid supply";
}

return null;
}

// =====================================================
// BUILD CONFIG
// =====================================================

async function buildConfig() {

const signer =
getSigner();

const owner =
await signer.getAddress();

const network =
await signer.provider.getNetwork();

return {

name:
  tokenName.value.trim(),

symbol:
  tokenSymbol.value.trim(),

supply:
  BigInt(
    tokenSupply.value
  ),

owner,

chainId:
  BigInt(
    network.chainId
  ),

launchKitVersion:
  200,

burnable:
  burnable?.checked || false,

mintable:
  mintable?.checked || false,

ownershipEnabled:
  ownership?.checked || false,

website: "",
telegram: "",
twitter: "",
logoURI: "",

maxWalletEnabled: false,
maxWalletPercent: 0,

maxTxEnabled: false,
maxTxPercent: 0,

tradingControlEnabled: false,
tradingEnabled: true,

buyTaxEnabled: false,
buyTax: 0,

sellTaxEnabled: false,
sellTax: 0,

burnTaxShare: 0,

marketingWallet:
  owner,

developmentWallet:
  owner

};
}

// =====================================================
// EVOZX BALANCE
// =====================================================

async function getBalance() {

const signer =
getSigner();

const owner =
await signer.getAddress();

const token =
new Contract(
CONTRACTS.EVOZX,
EVOZX_ABI,
signer
);

return await token.balanceOf(
owner
);
}

// =====================================================
// APPROVE FACTORY
// =====================================================

async function approveFactory(
amount
) {

const signer =
getSigner();

const owner =
await signer.getAddress();

const token =
new Contract(
CONTRACTS.EVOZX,
EVOZX_ABI,
signer
);

const allowance =
await token.allowance(
owner,
CONTRACTS.FACTORY
);

if (
allowance >= amount
) {
return;
}

const tx =
await token.approve(
CONTRACTS.FACTORY,
amount
);

await tx.wait();
}

// =====================================================
// DEPLOY
// =====================================================

async function deployToken() {

if (isDeploying) {
return;
}

try {

const validation =
  validateInput();

if (validation) {

  alert(validation);
  return;
}

isDeploying = true;

continueBtn.disabled =
  true;

continueBtn.textContent =
  "Preparing...";

const factory =
  await getFactoryForWrite();

if (!factory) {

  alert(
    "Wallet not connected"
  );

  return;
}

// =================================
// BUILD CONFIG
// =================================

const config =
  await buildConfig();

// =================================
// GET REAL FEE FROM CONTRACT
// =================================

continueBtn.textContent =
  "Calculating Fee...";

const deployFee =
  await getDeploymentFee(
    config
  );

// =================================
// CHECK BALANCE
// =================================

continueBtn.textContent =
  "Checking EVOZX...";

const balance =
  await getBalance();

if (
  balance < deployFee
) {

  const missing =
    Number(
      formatEther(
        deployFee - balance
      )
    );

  await autoTopupEVOZX(
    missing
  );
}

// =================================
// APPROVE
// =================================

continueBtn.textContent =
  "Approving EVOZX...";

await approveFactory(
  deployFee
);

// =================================
// DEPLOY TOKEN
// =================================

continueBtn.textContent =
  "Deploying Token...";

const tx =
  await factory.createToken(
    config
  );

const receipt =
  await tx.wait();

let tokenAddress =
  null;

for (
  const log
  of receipt.logs
) {

  try {

    const parsed =
      factory.interface.parseLog(
        log
      );

    if (
      parsed?.name ===
      "TokenCreated"
    ) {

      tokenAddress =
        parsed.args.token;

      break;
    }

  } catch {}
}

const signer =
  getSigner();

const owner =
  await signer.getAddress();

const historyItem = {

  token:
    tokenAddress,

  name:
    config.name,

  symbol:
    config.symbol,

  supply:
    config.supply.toString(),

  creator:
    owner,

  txHash:
    tx.hash,

  time:
    Date.now()

};

const history =
  JSON.parse(
    localStorage.getItem(
      "myTokens"
    ) || "[]"
  );

history.push(
  historyItem
);

localStorage.setItem(
  "myTokens",
  JSON.stringify(
    history
  )
);

localStorage.setItem(
  "lastDeployedToken",
  JSON.stringify(
    historyItem
  )
);

window.location.href =
  "./success.html";

} catch (error) {

console.error(
  "DEPLOY ERROR:",
  error
);

alert(
  error?.reason ||
  error?.message ||
  "Deploy failed"
);

} finally {

isDeploying = false;

if (continueBtn) {

  continueBtn.disabled =
    false;

  continueBtn.textContent =
    "Deploy Token";
}

}
}

// =====================================================
// INIT
// =====================================================

continueBtn?.addEventListener(
"click",
deployToken
);
