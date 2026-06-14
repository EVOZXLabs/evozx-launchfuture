// ======================================================
// EVOZ NETWORK
// ======================================================
export const NETWORK = {
  chainId: 805,
  chainHex: "0x325",
  chainName: "EVOZ",
  rpcUrls: ["https://rpc.evozscan.com"],
  blockExplorerUrls: ["https://evozscan.com"],
  nativeCurrency: {
    name: "EVOZ",
    symbol: "EVOZ",
    decimals: 18
  }
};

// ======================================================
// CONTRACTS
// ======================================================
export const CONTRACTS = {
  FACTORY: "0xbA40773bCF0d30e83c4319796Ec45CA31d6e64bB",
  EVOZX: "0x032a962F62Fc1cbc15B19767Aa138deA3B454B74",
  EXCHANGE: "0x24cCb720F7F8b9247FB50A88F6A6a5A5DD7d9ab8",
  TREASURY: "0x50Cd30Ff7f0fbBD9d0FDe1F60DE8c52D6F390c5C"
};

// ======================================================
// LINKS
// ======================================================
export const LINKS = {
  EXPLORER: "https://evozscan.com",
  ADDRESS: "https://evozscan.com/address/",
  TX: "https://evozscan.com/tx/"
};

// ======================================================
// APP INFO
// ======================================================
export const APP = {
  NAME: "EVOZX LaunchFuture",
  VERSION: "2.0.0"
};

// ======================================================
// FACTORY FEES
// ======================================================
export const FEES = {
  BASE: 10,
  BURNABLE: 5,
  MINTABLE: 20,
  OWNERSHIP: 5,
  MAX_WALLET: 5,
  MAX_TX: 5,
  TRADING_CONTROL: 10,
  BUY_TAX: 20,
  SELL_TAX: 20,
  WEBSITE: 1,
  TELEGRAM: 1,
  TWITTER: 1,
  LOGO: 2
};

// ======================================================
// TOKEN SETTINGS
// ======================================================
export const TOKEN_LIMITS = {
  MAX_SUPPLY: 1_000_000_000_000,
  MAX_SYMBOL_LENGTH: 12,
  MAX_BUY_TAX: 10,
  MAX_SELL_TAX: 10
};

// ======================================================
// FACTORY CONSTANTS
// ======================================================
export const FACTORY_INFO = {
  LAUNCHKIT_VERSION: 200,
  EVOZX_DECIMALS: 18
};
