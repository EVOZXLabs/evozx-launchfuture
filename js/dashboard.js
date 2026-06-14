const tokenList =
document.getElementById("tokenList");

// ==========================
// LOAD TOKENS
// ==========================

function loadTokens() {

  const data =
    JSON.parse(localStorage.getItem("myTokens") || "[]");

  if (!tokenList) return;

  if (data.length === 0) {

    tokenList.innerHTML =
      "<p>No tokens deployed yet.</p>";

    return;
  }

  tokenList.innerHTML = "";

  data.reverse().forEach((token, index) => {

    const el =
      document.createElement("div");

    el.style.border = "1px solid #444";
    el.style.padding = "10px";
    el.style.marginBottom = "10px";

    el.innerHTML = `
      <b>${token.name} (${token.symbol})</b><br/>
      Address: ${token.token || "N/A"}<br/>
      TX: ${token.txHash}<br/><br/>

      <button data-copy="${token.token}">
        Copy Address
      </button>

      <button data-open="${token.token}">
        Open Explorer
      </button>

      <button data-delete="${index}">
        Delete
      </button>
    `;

    tokenList.appendChild(el);
  });
}

// ==========================
// COPY
// ==========================

function copyAddress(address) {

  if (!address) return;

  navigator.clipboard.writeText(address);

  alert("Copied!");
}

// ==========================
// OPEN EXPLORER
// ==========================

function openExplorer(address) {

  if (!address) return;

  // GANTI dengan explorer EVOZ kamu
  const url =
    `https://evozscan.com/address/${address}`;

  window.open(url, "_blank");
}

// ==========================
// DELETE
// ==========================

function deleteToken(index) {

  const data =
    JSON.parse(localStorage.getItem("myTokens") || "[]");

  data.splice(data.length - 1 - index, 1);

  localStorage.setItem(
    "myTokens",
    JSON.stringify(data)
  );

  loadTokens();
}

// ==========================
// EVENTS
// ==========================

document.addEventListener("click", (e) => {

  const copy =
    e.target.getAttribute("data-copy");

  const open =
    e.target.getAttribute("data-open");

  const del =
    e.target.getAttribute("data-delete");

  if (copy) {
    copyAddress(copy);
  }

  if (open) {
    openExplorer(open);
  }

  if (del !== null) {
    deleteToken(Number(del));
  }
});

// ==========================
// INIT
// ==========================

loadTokens();
