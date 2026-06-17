import {

  Contract,

  JsonRpcProvider

} from "https://esm.sh/ethers@6";

import {

  CONTRACTS,

  NETWORK,

  ABI

} from "./config.js";

import {

  getSigner,

  getAccount

} from "./wallet.js";

import {

  getEVOZXBalance

} from "./factory.js";

let exchangeAbi;

let provider;

let exchangeRead;

let exchangeWrite;

// =====================================================
// ABI
// =====================================================

async function loadAbi(path){

  const response = await fetch(path);

  if(!response.ok){

    throw new Error(

      `Unable to load ABI: ${path}`

    );

  }

  return await response.json();

}

export async function loadExchangeAbi(){

  if(exchangeAbi){

    return exchangeAbi;

  }

  exchangeAbi = await loadAbi(

    ABI.exchange

  );

  return exchangeAbi;

}

// =====================================================
// PROVIDER
// =====================================================

export function getReadProvider(){

  if(provider){

    return provider;

  }

  provider = new JsonRpcProvider(

    NETWORK.rpcUrl

  );

  return provider;

}

// =====================================================
// CONTRACT
// =====================================================

export async function getExchangeRead(){

  if(exchangeRead){

    return exchangeRead;

  }

  const abi = await loadExchangeAbi();

  exchangeRead = new Contract(

    CONTRACTS.exchange,

    abi,

    getReadProvider()

  );

  return exchangeRead;

}

export async function getExchangeWrite(){

  const signer = getSigner();

  if(!signer){

    throw new Error(

      "Wallet not connected."

    );

  }

  const abi = await loadExchangeAbi();

  exchangeWrite = new Contract(

    CONTRACTS.exchange,

    abi,

    signer

  );

  return exchangeWrite;

}

// =====================================================
// INFO
// =====================================================

export async function getRate(){

  return (await getExchangeRead()).rate();

}

export async function getStock(){

  return (await getExchangeRead()).getAvailableStock();

}

export async function isPaused(){

  return (await getExchangeRead()).paused();

}

export async function getOwner(){

  return (await getExchangeRead()).owner();

}

export async function getTreasury(){

  return (await getExchangeRead()).treasury();

}

export async function getExchangeStatus(){

  const [

    paused,

    rate,

    stock,

    owner,

    treasury

  ] = await Promise.all([

    isPaused(),

    getRate(),

    getStock(),

    getOwner(),

    getTreasury()

  ]);

  return {

    paused,

    rate,

    stock,

    owner,

    treasury

  };

}

// =====================================================
// CALCULATION
// =====================================================

export async function calculateEVOZNeeded(missingEVOZX){

  if(missingEVOZX <= 0n){

    return 0n;

  }

  const rate = await getRate();

  return missingEVOZX * rate;

}

export async function hasEnoughStock(amount){

  return (await getStock()) >= amount;

}

export async function estimatePurchase(requiredFee){

  const account = await getAccount();

  const balance = await getEVOZXBalance(account);

  if(balance >= requiredFee){

    return {

      needPurchase: false,

      missingEVOZX: 0n,

      requiredEVOZ: 0n

    };

  }

  const missingEVOZX =

    requiredFee - balance;

  return {

    needPurchase: true,

    missingEVOZX,

    requiredEVOZ:

      await calculateEVOZNeeded(

        missingEVOZX

      )

  };

}

// =====================================================
// BUY EVOZX
// =====================================================

export async function buyEVOZX(requiredEVOZ){

  if(requiredEVOZ <= 0n){

    return null;

  }

  const exchange = await getExchangeWrite();

  const tx = await exchange.buyEVOZX({

    value: requiredEVOZ

  });

  await tx.wait();

  return tx;

}

// =====================================================
// AUTO TOPUP
// =====================================================

export async function autoTopupEVOZX(requiredFee){

  const account = await getAccount();

  const currentBalance = await getEVOZXBalance(

    account

  );

  if(currentBalance >= requiredFee){

    return {

      purchased: false,

      amount: 0n

    };

  }

  const missingEVOZX =

    requiredFee - currentBalance;

  const requiredEVOZ =

    await calculateEVOZNeeded(

      missingEVOZX

    );

  await buyEVOZX(

    requiredEVOZ

  );

  const updatedBalance =

    await getEVOZXBalance(

      account

    );

  if(updatedBalance < requiredFee){

    throw new Error(

      "Automatic EVOZX purchase failed."

    );

  }

  return {

    purchased: true,

    amount: missingEVOZX

  };

}
