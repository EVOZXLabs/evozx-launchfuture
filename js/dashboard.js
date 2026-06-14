// ==========================
// ELEMENT
// ==========================

const tokenList =
  document.getElementById("tokenList");

// ==========================
// LOAD TOKENS
// ==========================

function loadTokens() {

  if (!tokenList) return;

  const data =
    JSON.parse(localStorage.getItem("myTokens") || "[]");

  if (!Array.isArray(data) || data.length === 0) {

    tokenList.innerHTML =
      "<p>No tokens deployed yet.</p>";

    return;
  }

  tokenList.innerHTML = "";

  // gunakan slice() agar tidak mutate original
  const list = data.slice().reverse();

  list.forEach((token, index) => {

    const el = document.createElement("div");

    el.style.border = "1px solid #444";
    el.style.padding = "10px";
    el.style.marginBottom = "10px";
    el.style.borderRadius = "8px";

    const address =
      token?.token || "";

    el.innerHTML = `
      <b>${token?.name || "Unknown"} (${token?.symbol || "-"})</b><br/>
      Address: ${address || "N/A"}<br/>
      TX: ${token?.txHash || "-"}<br/><br/>

      <button data-view="${address}">
        View
      </button>

      <button data-copy="${address}">
        Copy
      </button>

      <button data-open="${address}">
        Explorer
      </button>

      <button data-delete="${index}">
        Delete
      </button>
    `;

    tokenList.appendChild(el);
  });
}

// ==========================
// COPY ADDRESS
// ==========================

async function copyAddress(address) {

  if (!address) return;

  try {

    if (navigator.clipboard) {

      await navigator.clipboard.writeText(address);

    } else {

      // fallback untuk device lama
      const textarea =
        document.createElement("textarea");

      textarea.value = address;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      textarea.remove();
    }

    alert("Copied!");

  } catch (err) {

    console.error(err);
    alert("Copy failed");
  }
}

// ==========================
// OPEN EXPLORER
// ==========================

function openExplorer(address) {

  if (!address) return;

  const url =
    `https://evozscan.com/address/${address}`;

  window.open(url, "_blank");
}

// ==========================
// DELETE TOKEN
// ==========================

function deleteToken(viewIndex) {

  const data =
    JSON.parse(localStorage.getItem("myTokens") || "[]");

  if (!Array.isArray(data)) return;

  // karena kita reverse di UI,
  // index perlu dikonversi balik
  const realIndex =
    data.length - 1 - viewIndex;

  if (realIndex < 0 || realIndex >= data.length) return;

  data.splice(realIndex, 1);

  localStorage.setItem(
    "myTokens",
    JSON.stringify(data)
  );

  loadTokens();
}

// ==========================
// VIEW TOKEN (STEP 9)
// ==========================

function viewToken(address) {

  if (!address) return;

  localStorage.setItem("viewToken", address);

  window.location.href = "./token.html";
}

// ==========================
// EVENTS (GLOBAL DELEGATION)
// ==========================

document.addEventListener("click", (e) => {

  const target = e.target;

  if (!(target instanceof HTMLElement)) return;

  const copy =
    target.getAttribute("data-copy");

  const open =
    target.getAttribute("data-open");

  const del =
    target.getAttribute("data-delete");

  const view =
    target.getAttribute("data-view");

  if (copy) {
    copyAddress(copy);
    return;
  }

  if (open) {
    openExplorer(open);
    return;
  }

  if (view) {
    viewToken(view);
    return;
  }

  if (del !== null) {
    deleteToken(Number(del));
    return;
  }
});

// ==========================
// INIT
// ==========================

loadTokens();
