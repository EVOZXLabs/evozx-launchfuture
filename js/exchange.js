import {
BrowserProvider,
Contract,
parseEther,
formatEther
} from "https://esm.sh/ethers@6";

import {
CONTRACTS
} from "./config.js";

import {
getSigner
} from "./wallet.js";

// =====================================================
// ABI CACHE
// =====================================================

let EXCHANGE_ABI = null;

// =====================================================
// ABI LOADER
// =====================================================

async function loadExchangeAbi() {

if (EXCHANGE_ABI) {
return EXCHANGE_ABI;
}

try {

const response =
  await fetch(
    "./abi/exchange.json"
  );

EXCHANGE_ABI =
  await response.json();

return EXCHANGE_ABI;

} catch (error) {

console.error(
  "Exchange ABI error:",
  error
);

throw error;

}
}

// =====================================================
// PROVIDER
// =====================================================

function getReadProvider() {

if (!window.ethereum) {

throw new Error(
  "Wallet not found"
);

}

return new BrowserProvider(
window.ethereum
);
}

// =====================================================
// CONTRACTS
// =====================================================

async function getExchangeRead() {

const provider =
getReadProvider();

const abi =
await loadExchangeAbi();

return new Contract(
CONTRACTS.EXCHANGE,
abi,
provider
);
}

async function getExchangeWrite() {

const signer =
getSigner();

if (!signer) {

throw new Error(
  "Wallet not connected"
);

}

const abi =
await loadExchangeAbi();

return new Contract(
CONTRACTS.EXCHANGE,
abi,
signer
);
}

// =====================================================
// RATE
// =====================================================

export async function getRate() {

try {

const exchange =
  await getExchangeRead();

const rate =
  await exchange.rate();

return Number(rate);

} catch (error) {

console.error(
  "Rate error:",
  error
);

return 0;

}
}

// =====================================================
// STOCK
// =====================================================

export async function getStock() {

try {

const exchange =
  await getExchangeRead();

const stock =
  await exchange.getAvailableStock();

return Number(
  formatEther(stock)
);

} catch (error) {

console.error(
  "Stock error:",
  error
);

return 0;

}
}

// =====================================================
// EVOZ REQUIRED
// =====================================================

export async function calculateEVOZNeeded(
missingEVOZX
) {

const rate =
await getRate();

if (!rate) {

throw new Error(
  "Invalid exchange rate"
);

}

return (
Number(missingEVOZX) / rate
);
}

// =====================================================
// BUY EVOZX
// =====================================================

export async function buyEVOZX(
evozAmount
) {

const exchange =
await getExchangeWrite();

const tx =
await exchange.buyEVOZX({

  value:
    parseEther(
      String(
        evozAmount
      )
    )

});

await tx.wait();

return tx.hash;
}

// =====================================================
// AUTO TOPUP
// =====================================================

export async function autoTopupEVOZX(
missingEVOZX
) {

const missing =
Number(
missingEVOZX
);

if (
missing <= 0
) {

return {

  success: true,
  purchased: false

};

}

const stock =
await getStock();

if (
stock < missing
) {

throw new Error(
  "Exchange stock insufficient"
);

}

const evozNeeded =
await calculateEVOZNeeded(
missing
);

const txHash =
await buyEVOZX(
evozNeeded
);

return {

success: true,

purchased: true,

missing,

evozNeeded,

txHash

};
}
