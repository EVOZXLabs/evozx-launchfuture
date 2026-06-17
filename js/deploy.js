import {

  ZeroAddress

} from "https://esm.sh/ethers@6";

import {

  STORAGE

} from "./config.js";

import {

  getAccount

} from "./wallet.js";

import {

  validateConfig

} from "./validation.js";

import {

  symbolExists,

  getDeploymentFee,

  getEVOZXBalance,

  getEVOZXAllowance,

  approveEVOZX,

  createToken

} from "./factory.js";

import {

  autoTopupEVOZX

} from "./exchange.js";

// =====================================================
// CONFIG
// =====================================================

export function buildDeployment(form){

  return{

    name:

      form.name.trim(),

    symbol:

      form.symbol

        .trim()

        .toUpperCase(),

    supply:

      BigInt(form.supply),

    owner:

      ZeroAddress,

    chainId:0,

    launchKitVersion:0,

    burnable:

      !!form.burnable,

    mintable:

      !!form.mintable,

    ownershipEnabled:

      !!form.ownershipEnabled,

    website:

      form.website?.trim() ?? "",

    telegram:

      form.telegram?.trim() ?? "",

    twitter:

      form.twitter?.trim() ?? "",

    logoURI:

      form.logoURI?.trim() ?? "",

    maxWalletEnabled:

      !!form.maxWalletEnabled,

    maxWalletPercent:

      Number(

        form.maxWalletEnabled

          ? form.maxWalletPercent

          : 0

      ),

    maxTxEnabled:

      !!form.maxTxEnabled,

    maxTxPercent:

      Number(

        form.maxTxEnabled

          ? form.maxTxPercent

          : 0

      ),

    tradingControlEnabled:

      !!form.tradingControlEnabled,

    tradingEnabled:

      !!form.tradingEnabled,

    buyTaxEnabled:

      !!form.buyTaxEnabled,

    buyTax:

      Number(

        form.buyTaxEnabled

          ? form.buyTax

          : 0

      ),

    sellTaxEnabled:

      !!form.sellTaxEnabled,

    sellTax:

      Number(

        form.sellTaxEnabled

          ? form.sellTax

          : 0

      ),

    burnTaxShare:

      Number(

        form.buyTaxEnabled ||

        form.sellTaxEnabled

          ? form.burnTaxShare

          : 0

      ),

    marketingWallet:

      form.marketingWallet ||

      ZeroAddress,

    developmentWallet:

      form.developmentWallet ||

      ZeroAddress

  };

}

// =====================================================
// PREVIEW
// =====================================================

export async function getDeploymentPreview(form){

  const account=

    await getAccount();

  if(!account){

    throw new Error(

      "Wallet not connected."

    );

  }

  const config=

    buildDeployment(form);

  const error=

    validateConfig(config);

  if(error){

    throw new Error(error);

  }

  const fee=

    await getDeploymentFee(config);

  const balance=

    await getEVOZXBalance(

      account

    );

  const allowance=

    await getEVOZXAllowance(

      account

    );

  return{

    fee,

    balance,

    allowance,

    enoughBalance:

      balance>=fee,

    approved:

      allowance>=fee

  };

}

// =====================================================
// APPROVAL
// =====================================================

export async function approveFactory(config){

  const account=

    await getAccount();

  if(!account){

    throw new Error(

      "Wallet not connected."

    );

  }

  const fee=

    await getDeploymentFee(config);

  const allowance=

    await getEVOZXAllowance(

      account

    );

  if(

    allowance>=fee

  ){

    return fee;

  }

  const tx=

    await approveEVOZX(fee);

  await tx.wait();

  return fee;

}

// =====================================================
// DEPLOY
// =====================================================

export async function deployToken(form){

  const account = await getAccount();

  if(!account){

    throw new Error(

      "Wallet not connected."

    );

  }

  const config =

    buildDeployment(form);

  const error =

    validateConfig(config);

  if(error){

    throw new Error(error);

  }

  if(

    await symbolExists(

      config.symbol

    )

  ){

    throw new Error(

      "Symbol already exists."

    );

  }

  const fee =

    await getDeploymentFee(

      config

    );

  const balance =

    await getEVOZXBalance(

      account

    );

  if(balance < fee){

    await autoTopupEVOZX(

      fee

    );

  }

  await approveFactory(

    config

  );

  const result =

    await createToken(

      config

    );

  const deployment = {

    hash:

      result.hash,

    token:

      result.token,

    creator:

      result.creator,

    name:

      result.name,

    symbol:

      result.symbol,

    supply:

      result.supply.toString(),

    chainId:

      result.chainId.toString(),

    deployedAt:

      Date.now()

  };

  localStorage.setItem(

    STORAGE.lastToken,

    JSON.stringify(

      deployment

    )

  );

  const history = JSON.parse(

    localStorage.getItem(

      STORAGE.deployHistory

    ) ?? "[]"

  );

  history.unshift(

    deployment

  );

  localStorage.setItem(

    STORAGE.deployHistory,

    JSON.stringify(

      history

    )

  );

  window.location.href =

    `success.html?token=${result.token}`;

      }
