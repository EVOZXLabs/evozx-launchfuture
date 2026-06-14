import { BrowserProvider, Contract } from "https://esm.sh/ethers@6";

// ==========================
// LOAD ABI
// ==========================

let ABI = null;

async function loadAbi() {

  if (ABI) return ABI;

  const res =
    await fetch("./abi/evozx.json");

  ABI = await res.json();

  return ABI;
}

// ==========================
// LOAD TOKEN DATA
// ==========================

async function loadToken() {

  const container =
    document.getElementById("tokenDetail");

  const address =
    localStorage.getItem("viewToken");

  if (!address) {
    container.textContent =
      "No token selected";
    return;
  }

  try {

    if (!window.ethereum) {
      container.textContent =
        "Wallet not found";
      return;
    }

    const provider =
      new BrowserProvider(window.ethereum);

    const abi =
      await loadAbi();

    const token =
      new Contract(address, abi, provider);

    // ==========================
    // FETCH DATA
    // ==========================

    const name =
      await token.name();

    const symbol =
      await token.symbol();

    const supply =
      await token.totalSupply();

    let owner = "N/A";

    try {
      owner = await token.owner();
    } catch {}

    // OPTIONAL FEATURES (kalau ada di contract)
    let burnable = false;
    let mintable = false;

    try {
      burnable = await token.burnable();
    } catch {}

    try {
      mintable = await token.mintable();
    } catch {}

    // ==========================
    // RENDER
    // ==========================

    container.innerHTML = `
      <p><b>Name:</b> ${name}</p>
      <p><b>Symbol:</b> ${symbol}</p>
      <p><b>Supply:</b> ${supply.toString()}</p>
      <p><b>Owner:</b> ${owner}</p>
      <p><b>Address:</b> ${address}</p>
      <p><b>Burnable:</b> ${burnable}</p>
      <p><b>Mintable:</b> ${mintable}</p>
    `;

  } catch (error) {

    console.error(error);

    container.textContent =
      "Failed to load token data";
  }
}

// ==========================
// INIT
// ==========================

loadToken();
