import {

  connectWallet,

  disconnectWallet,

  getAccount

}
from "./wallet.js";

const connectBtn =
document.getElementById(
  "connectBtn"
);

const launchBtn =
document.getElementById(
  "launchBtn"
);

const addNetworkBtn =
document.getElementById(
  "addNetworkBtn"
);

connectBtn?.addEventListener(

  "click",

  async () => {

    const connected =
    getAccount();

    if (connected) {

      const confirmDisconnect =

      confirm(
        "Disconnect wallet?"
      );

      if (
        confirmDisconnect
      ) {

        disconnectWallet();

      }

      return;
    }

    await connectWallet();

  }

);

launchBtn?.addEventListener(

  "click",

  () => {

    window.location.href =
    "./launch.html";

  }

);

addNetworkBtn?.addEventListener(

  "click",

  async () => {

    if (!window.ethereum) {

      alert(
        "Wallet not detected."
      );

      return;
    }

    try {

      await window.ethereum.request({

        method:
        "wallet_addEthereumChain",

        params: [

          {

            chainId:
            "0x325",

            chainName:
            "EVOZ Mainnet",

            nativeCurrency: {

              name:
              "EVOZ",

              symbol:
              "EVOZ",

              decimals:
              18

            },

            rpcUrls: [

              "https://rpc.evozscan.com"

            ],

            blockExplorerUrls: [

              "https://evozscan.com"

            ]

          }

        ]

      });

    } catch (error) {

      console.error(
        error
      );

    }

  }

);
