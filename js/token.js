import { BrowserProvider, Contract } from "https://esm.sh/ethers@6";

// ==========================
// LOAD ABI
// ==========================
let ABI = null;
const loadAbi = async () => ABI || (ABI = await (await fetch("./abi/evozx.json")).json());

// ==========================
// LOAD TOKEN DATA
// ==========================
async function loadToken() {
    const container = document.getElementById("tokenDetail");
    const address = localStorage.getItem("viewToken");

    if (!address) return container.textContent = "No token selected";
    container.textContent = "Loading token data...";

    try {
        if (!window.ethereum) throw new Error("Wallet not found");
        
        const provider = new BrowserProvider(window.ethereum);
        const token = new Contract(address, await loadAbi(), provider);

        // Fetch data secara paralel agar lebih cepat
        const [name, symbol, supply, owner] = await Promise.all([
            token.name(),
            token.symbol(),
            token.totalSupply(),
            token.owner().catch(() => "N/A")
        ]);

        // Fetch fitur opsional
        const [burnable, mintable] = await Promise.all([
            token.burnable().catch(() => false),
            token.mintable().catch(() => false)
        ]);

        // ==========================
        // RENDER
        // ==========================
        container.innerHTML = `
            <div class="card">
                <p><b>Name:</b> ${name}</p>
                <p><b>Symbol:</b> ${symbol}</p>
                <p><b>Supply:</b> ${supply.toString()}</p>
                <p><b>Owner:</b> ${owner}</p>
                <p><b>Address:</b> ${address}</p>
                <p><b>Burnable:</b> ${burnable ? "✅ Yes" : "❌ No"}</p>
                <p><b>Mintable:</b> ${mintable ? "✅ Yes" : "❌ No"}</p>
            </div>
        `;

    } catch (error) {
        console.error(error);
        container.textContent = "Failed to load token data";
    }
}

// ==========================
// INIT
// ==========================
loadToken();
