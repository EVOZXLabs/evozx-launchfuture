// =====================================================
// HELPERS
// =====================================================
const getTokens = () => JSON.parse(localStorage.getItem("myTokens") || "[]");
const saveTokens = (data) => localStorage.setItem("myTokens", JSON.stringify(data));

async function copyText(text) {
    if (!text) return;
    try {
        await navigator.clipboard.writeText(text);
        alert("Copied!");
    } catch {
        alert("Copy failed");
    }
}

// =====================================================
// CORE FUNCTIONS
// =====================================================

function loadTokens() {
    const tokenList = document.getElementById("tokenList");
    if (!tokenList) return;

    const data = getTokens();
    if (data.length === 0) {
        tokenList.innerHTML = "<p>No tokens deployed yet.</p>";
        return;
    }

    tokenList.innerHTML = "";
    // Membalik urutan agar yang terbaru di atas
    const list = [...data].reverse();

    list.forEach((token, index) => {
        const div = document.createElement("div");
        div.style.cssText = "border:1px solid #444; padding:10px; margin-bottom:10px; border-radius:8px;";
        
        div.innerHTML = `
            <b>${token.name} (${token.symbol})</b><br/>
            Address: ${token.token || "N/A"}<br/>
            TX: ${token.txHash?.slice(0, 10) || "-"}...<br/><br/>
            <button data-view="${token.token}">View</button>
            <button data-copy="${token.token}">Copy</button>
            <button data-open="${token.token}">Explorer</button>
            <button data-delete="${index}" style="color:red">Delete</button>
        `;
        tokenList.appendChild(div);
    });
}

function deleteToken(reversedIndex) {
    const data = getTokens();
    // Konversi balik dari index reversed ke index array asli
    const realIndex = data.length - 1 - reversedIndex;
    
    if (realIndex >= 0 && realIndex < data.length) {
        data.splice(realIndex, 1);
        saveTokens(data);
        loadTokens();
    }
}

// =====================================================
// EVENT DELEGATION
// =====================================================

document.addEventListener("click", (e) => {
    const target = e.target;
    if (!target.dataset) return;

    const { view, copy, open, delete: del } = target.dataset;

    if (view) {
        localStorage.setItem("viewToken", view);
        window.location.href = "./token.html";
    }
    if (copy) copyText(copy);
    if (open) window.open(`https://evozscan.com/address/${open}`, "_blank");
    if (del !== undefined) deleteToken(Number(del));
});

// =====================================================
// INIT
// =====================================================
loadTokens();
