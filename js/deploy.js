import { getFactoryForWrite } from "./factory.js";

// ==========================
// ELEMENTS
// ==========================

const continueBtn =
document.getElementById("continueBtn");

const tokenName =
document.getElementById("tokenName");

const tokenSymbol =
document.getElementById("tokenSymbol");

const tokenSupply =
document.getElementById("tokenSupply");

const burnable =
document.getElementById("burnable");

const mintable =
document.getElementById("mintable");

const ownership =
document.getElementById("ownership");

// ==========================
// STATE
// ==========================

let isDeploying = false;

// ==========================
// HELPER
// ==========================

function getChainIdHex() {

  return "0x" +
    Number(window.ethereum.chainId).toString(16);
}

// ==========================
// DEPLOY TOKEN
// ==========================

async function deployToken() {

  if (isDeploying) return;

  try {

    if (!window.ethereum) {
      alert("Wallet not found");
      return;
    }

    isDeploying = true;

    continueBtn.disabled = true;
    continueBtn.textContent = "Deploying...";

    const factory =
      await getFactoryForWrite();

    // ==========================
    // BUILD CONFIG (WAJIB SESUAI ABI)
    // ==========================

    const config = {

      name: tokenName.value.trim(),
      symbol: tokenSymbol.value.trim(),
      supply: BigInt(tokenSupply.value || 0),

      owner: await factory.signer.getAddress(),
      chainId: BigInt(window.ethereum.chainId),

      launchKitVersion: 1,

      burnable: burnable?.checked || false,
      mintable: mintable?.checked || false,
      ownershipEnabled: ownership?.checked || false,

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

      marketingWallet: await factory.signer.getAddress(),
      developmentWallet: await factory.signer.getAddress()
    };

    // ==========================
    // SEND TRANSACTION
    // ==========================

    const tx =
      await factory.createToken(config);

    console.log("TX SENT:", tx.hash);

    // optional: loading wait
    const receipt =
      await tx.wait();

    console.log("TX CONFIRMED:", receipt);

    alert("Token created successfully!");

    // redirect nanti (STEP 7)
    window.location.href =
      "./success.html";

  } catch (error) {

    console.error("DEPLOY ERROR:", error);

    alert(
      error?.reason ||
      error?.message ||
      "Deploy failed"
    );

  } finally {

    isDeploying = false;

    continueBtn.disabled = false;
    continueBtn.textContent = "Continue";
  }
}

// ==========================
// INIT
// ==========================

continueBtn?.addEventListener(
  "click",
  deployToken
);
