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
// VALIDATION
// ==========================

function validateInput() {

  const name = tokenName?.value?.trim();
  const symbol = tokenSymbol?.value?.trim();
  const supply = tokenSupply?.value;

  if (!name) return "Token name required";
  if (!symbol) return "Token symbol required";

  if (!supply || isNaN(supply) || Number(supply) <= 0)
    return "Invalid supply";

  return null;
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

    const errorMsg =
      validateInput();

    if (errorMsg) {
      alert(errorMsg);
      return;
    }

    const factory =
      await getFactoryForWrite();

    if (!factory) {
      alert("Wallet not connected");
      return;
    }

    isDeploying = true;

    if (continueBtn) {
      continueBtn.disabled = true;
      continueBtn.textContent = "Deploying...";
    }

    // ==========================
    // GET USER DATA
    // ==========================

    const signer =
      factory.runner; // ethers v6

    const owner =
      await signer.getAddress();

    const chainId =
      BigInt(window.ethereum.chainId || 0);

    // ==========================
    // BUILD CONFIG
    // ==========================

    const config = {

      name: tokenName.value.trim(),
      symbol: tokenSymbol.value.trim(),
      supply: BigInt(tokenSupply.value),

      owner,
      chainId,

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

      marketingWallet: owner,
      developmentWallet: owner
    };

    // ==========================
    // SEND TX
    // ==========================

    const tx =
      await factory.createToken(config);

    console.log("TX SENT:", tx.hash);

    const receipt =
      await tx.wait();

    console.log("RECEIPT:", receipt);

    // ==========================
    // EXTRACT EVENT
    // ==========================

    let tokenAddress = null;

    for (const log of receipt.logs) {

      try {

        const parsed =
          factory.interface.parseLog(log);

        if (parsed?.name === "TokenCreated") {

          tokenAddress =
            parsed.args.token;

          break;
        }

      } catch {
        continue;
      }
    }

    // fallback kalau event gagal
    if (!tokenAddress) {
      console.warn("TokenCreated event not found");
    }

    console.log("TOKEN:", tokenAddress);

    // ==========================
    // SAVE HISTORY
    // ==========================

    const historyItem = {
      token: tokenAddress,
      name: config.name,
      symbol: config.symbol,
      supply: config.supply.toString(),
      creator: owner,
      txHash: tx.hash,
      time: Date.now()
    };

    const old =
      JSON.parse(localStorage.getItem("myTokens") || "[]");

    old.push(historyItem);

    localStorage.setItem(
      "myTokens",
      JSON.stringify(old)
    );

    // ==========================
    // SAVE LAST (SUCCESS PAGE)
    // ==========================

    localStorage.setItem(
      "lastDeployedToken",
      JSON.stringify(historyItem)
    );

    // ==========================
    // REDIRECT
    // ==========================

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

    if (continueBtn) {
      continueBtn.disabled = false;
      continueBtn.textContent = "Continue";
    }
  }
}

// ==========================
// INIT
// ==========================

continueBtn?.addEventListener(
  "click",
  deployToken
);
