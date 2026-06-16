import {

  Contract,

  JsonRpcProvider,

  Interface

} from "https://esm.sh/ethers@6";

import {

  CONTRACTS,

  NETWORK,

  ABI

} from "./config.js";

import {

  getSigner

} from "./wallet.js";

let factoryAbi;

let evozxAbi;

let factoryInterface;

let readProvider;

let factoryRead;

let factoryWrite;

let evozxRead;

let evozxWrite;

async function loadAbi(path){

  const response = await fetch(path);

  if(!response.ok){

    throw new Error(`Unable to load ABI: ${path}`);

  }

  return await response.json();

}

export async function loadFactoryAbi(){

  if(factoryAbi){

    return factoryAbi;

  }

  factoryAbi = await loadAbi(ABI.factory);

  factoryInterface = new Interface(factoryAbi);

  return factoryAbi;

}

export async function loadEVOZXAbi(){

  if(evozxAbi){

    return evozxAbi;

  }

  evozxAbi = await loadAbi(ABI.evozx);

  return evozxAbi;

}

export function getReadProvider(){

  if(readProvider){

    return readProvider;

  }

  readProvider = new JsonRpcProvider(

    NETWORK.rpcUrl

  );

  return readProvider;

}

export async function getFactoryRead(){

  if(factoryRead){

    return factoryRead;

  }

  const abi = await loadFactoryAbi();

  factoryRead = new Contract(

    CONTRACTS.factory,

    abi,

    getReadProvider()

  );

  return factoryRead;

}

export async function getEVOZXRead(){

  if(evozxRead){

    return evozxRead;

  }

  const abi = await loadEVOZXAbi();

  evozxRead = new Contract(

    CONTRACTS.evozx,

    abi,

    getReadProvider()

  );

  return evozxRead;

}

export async function getFactoryWrite(){

  const signer = getSigner();

  if(!signer){

    throw new Error("Wallet not connected.");

  }

  const abi = await loadFactoryAbi();

  factoryWrite = new Contract(

    CONTRACTS.factory,

    abi,

    signer

  );

  return factoryWrite;

}

export const getFactoryForWrite = getFactoryWrite;

export async function getEVOZXWrite(){

  const signer = getSigner();

  if(!signer){

    throw new Error("Wallet not connected.");

  }

  const abi = await loadEVOZXAbi();

  evozxWrite = new Contract(

    CONTRACTS.evozx,

    abi,

    signer

  );

  return evozxWrite;

}

function parseTokenCreated(receipt){

  if(!receipt){

    return null;

  }

  for(const log of receipt.logs){

    try{

      const parsed = factoryInterface.parseLog(log);

      if(parsed?.name === "TokenCreated"){

        return {

          token: parsed.args.token,

          creator: parsed.args.creator,

          name: parsed.args.name,

          symbol: parsed.args.symbol,

          supply: parsed.args.supply,

          chainId: parsed.args.chainId

        };

      }

    }

    catch{

      // Ignore logs from other contracts.

    }

  }

  return null;

}

// ================= FACTORY INFO =================

// ================= FACTORY INFO =================

export async function getFactoryName(){

  return (await getFactoryRead()).FACTORY_NAME();

}

export async function getVersion(){

  return (await getFactoryRead()).VERSION();

}

export async function getLaunchKitVersion(){

  return (await getFactoryRead()).LAUNCHKIT_VERSION();

}

export async function getOwner(){

  return (await getFactoryRead()).owner();

}

export async function getTreasury(){

  return (await getFactoryRead()).treasury();

}

export async function getFeeMultiplier(){

  return (await getFactoryRead()).feeMultiplier();

}

// ================= TOKEN DATA =================

export async function getTotalTokens(){

  return Number(

    await (await getFactoryRead()).totalTokens()

  );

}

export async function getAllTokens(){

  return (await getFactoryRead()).getAllTokens();

}

export async function getToken(index){

  return (await getFactoryRead()).getToken(index);

}

export async function getTokensByCreator(address){

  if(!address){

    return [];

  }

  return (await getFactoryRead()).getTokensByCreator(

    address

  );

}

export async function isFactoryToken(address){

  if(!address){

    return false;

  }

  return (await getFactoryRead()).isTokenFromFactory(

    address

  );

}

// ================= SYMBOL =================

export async function symbolExists(symbol){

  if(!symbol){

    return false;

  }

  return (await getFactoryRead()).symbolExists(

    symbol

      .trim()

      .toUpperCase()

  );

}

// ================= DEPLOYMENT =================

export async function getDeploymentFee(config){

  return (await getFactoryRead()).getDeploymentFee(

    config

  );

}

// ================= EVOZX =================

export async function getEVOZXBalance(address){

  if(!address){

    return 0n;

  }

  return (await getEVOZXRead()).balanceOf(

    address

  );

}

export async function getEVOZXAllowance(address){

  if(!address){

    return 0n;

  }

  return (await getEVOZXRead()).allowance(

    address,

    CONTRACTS.factory

  );

}

// ================= APPROVE EVOZX =================

export async function approveEVOZX(amount){

  if(!amount || amount <= 0n){

    throw new Error("Invalid approval amount.");

  }

  const token = await getEVOZXWrite();

  const tx = await token.approve(

    CONTRACTS.factory,

    amount

  );

  await tx.wait();

  return tx;

}

// ================= CREATE TOKEN =================

export async function createToken(config){

  const factory = await getFactoryWrite();

  const tx = await factory.createToken(config);

  const receipt = await tx.wait();

  const event = parseTokenCreated(receipt);

  if(!event){

    throw new Error("TokenCreated event not found.");

  }

  return {

    hash: tx.hash,

    blockNumber: receipt.blockNumber,

    token: event.token,

    creator: event.creator,

    name: event.name,

    symbol: event.symbol,

    supply: event.supply,

    chainId: event.chainId

  };

}

// ================= HELPERS =================

export async function ensureApproval(owner, amount){

  const allowance = await getEVOZXAllowance(owner);

  if(allowance >= amount){

    return false;

  }

  await approveEVOZX(amount);

  return true;

}

export async function hasEnoughEVOZX(owner, amount){

  const balance = await getEVOZXBalance(owner);

  return balance >= amount;

}

export async function getDeploymentPreview(config, owner){

  const fee = await getDeploymentFee(config);

  const balance = await getEVOZXBalance(owner);

  const allowance = await getEVOZXAllowance(owner);

  return {

    fee,

    balance,

    allowance,

    enoughBalance: balance >= fee,

    approved: allowance >= fee

  };

}

// ================= FORMAT =================

export function toBigInt(value){

  return BigInt(value);

}

export function isZeroAddress(address){

  return (

    !address ||

    address ===

    "0x0000000000000000000000000000000000000000"

  );

}
