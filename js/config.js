export const NETWORK = {

  chainId: 805,

  chainIdHex: "0x325",

  name: "EVOZ Mainnet",

  symbol: "EVOZ",

  decimals: 18,

  rpcUrl: "https://rpc.evozscan.com",

  explorer: "https://evozscan.com"

};

export const CONTRACTS = {

  factory: "0xbA40773bCF0d30e83c4319796Ec45CA31d6e64bB",

  evozx: "0x032a962F62Fc1cbc15B19767Aa138deA3B454B74",

  exchange: "0x24cCb720F7F8b9247FB50A88F6A6a5A5DD7d9ab8",

  treasury: "0x50Cd30Ff7f0fbBD9d0FDe1F60DE8c52D6F390c5C"

};

export const STORAGE = {

  wallet: "launchfuture_wallet",

  theme: "launchfuture_theme",

  lastToken: "launchfuture_last_token",

  deployHistory: "launchfuture_deploy_history"

};

export const ABI = {

  factory: "./abi/factory.json",

  exchange: "./abi/exchange.json",

  evozx: "./abi/evozx.json",

  token: "./abi/token.json"

};

export const DOWNLOADS = {

  standardInput: "./docs/standard-input.json"

};

export const ASSETS = {

  logo: "./images/logo.png"

};

export const EXCHANGE = {

  // 1 EVOZX = 5 EVOZ

  evozPerEVOZX: 5

};

export const UI = {

  addressPrefix: 6,

  addressSuffix: 4,

  animation: 250

};

export function explorerAddress(address) {

  return `${NETWORK.explorer}/address/${address}`;

}

export function explorerToken(address) {

  return `${NETWORK.explorer}/token/${address}`;

}

export function explorerTransaction(hash) {

  return `${NETWORK.explorer}/tx/${hash}`;

}
