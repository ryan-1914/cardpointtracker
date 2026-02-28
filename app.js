const CATEGORIES = [
  { id: "dining", label: "Dining / Restaurants" },
  { id: "groceries", label: "Groceries" },
  { id: "gas", label: "Gas" },
  { id: "travel", label: "Travel" },
  { id: "transit", label: "Transit" },
  { id: "rideshare", label: "Rideshare" },
  { id: "streaming", label: "Streaming Services" },
  { id: "online", label: "Online Shopping" },
  { id: "drugstore", label: "Drugstores" },
  { id: "other", label: "Everything Else" },
];

const DB_NAME = "cardtracker-db";
const DB_VERSION = 1;
const STORE_CARDS = "cards";
const CATALOG_FEEDBACK_MS = 1800;

const state = {
  cards: [],
  editingCardId: null,
  catalogCards: [],
  catalogSearch: "",
  catalogIssuer: "all",
  catalogFeedbackById: {},
};

const els = {
  categoryPicker: document.getElementById("categoryPicker"),
  result: document.getElementById("result"),
  ranking: document.getElementById("ranking"),
  catalogSearch: document.getElementById("catalogSearch"),
  catalogList: document.getElementById("catalogList"),
  catalogCount: document.getElementById("catalogCount"),
  catalogIssuer: document.getElementById("catalogIssuer"),
  cardList: document.getElementById("cardList"),
  cardCount: document.getElementById("cardCount"),
  cardForm: document.getElementById("cardForm"),
  formTitle: document.getElementById("formTitle"),
  saveCardBtn: document.getElementById("saveCardBtn"),
  cancelEdit: document.getElementById("cancelEdit"),
  cardName: document.getElementById("cardName"),
  issuer: document.getElementById("issuer"),
  rewardRows: document.getElementById("rewardRows"),
  addRewardRow: document.getElementById("addRewardRow"),
  rewardRowTemplate: document.getElementById("rewardRowTemplate"),
};

let dbPromise;
let comparisonCore;
let catalogCore;
let walletCore;
const catalogFeedbackTimers = new Map();

bootstrap();

async function bootstrap() {
  try {
    comparisonCore = await loadComparisonCore();
    catalogCore = await loadCatalogCore();
    walletCore = await loadWalletCore();
    await init();
  } catch (error) {
    console.error(error);
    els.result.textContent = "Error loading app data.";
  }
}

async function init() {
  populateCategoryPickers();
  wireEvents();
  dbPromise = openDb();
  const storedCards = await readCards();
  state.cards = walletCore.normalizeWalletCards(storedCards);
  state.catalogCards = catalogCore.buildCatalogCards();
  populateCatalogIssuerOptions();
  resetForm();
  render();
  registerServiceWorker();
}

async function loadComparisonCore() {
  if (globalThis.CardTrackerComparisonCore) {
    return globalThis.CardTrackerComparisonCore;
  }

  await new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = "/comparison-core.js";
    script.async = false;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Failed to load comparison-core.js"));
    document.head.appendChild(script);
  });

  if (!globalThis.CardTrackerComparisonCore) {
    throw new Error("Comparison core unavailable after script load");
  }

  return globalThis.CardTrackerComparisonCore;
}

async function loadCatalogCore() {
  if (globalThis.CardTrackerCatalogCore) {
    return globalThis.CardTrackerCatalogCore;
  }

  await new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = "/catalog-core.js";
    script.async = false;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Failed to load catalog-core.js"));
    document.head.appendChild(script);
  });

  if (!globalThis.CardTrackerCatalogCore) {
    throw new Error("Catalog core unavailable after script load");
  }

  return globalThis.CardTrackerCatalogCore;
}

async function loadWalletCore() {
  if (globalThis.CardTrackerWalletCore) {
    return globalThis.CardTrackerWalletCore;
  }

  await new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = "/wallet-core.js";
    script.async = false;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Failed to load wallet-core.js"));
    document.head.appendChild(script);
  });

  if (!globalThis.CardTrackerWalletCore) {
    throw new Error("Wallet core unavailable after script load");
  }

  return globalThis.CardTrackerWalletCore;
}

function wireEvents() {
  els.addRewardRow.addEventListener("click", () => addRewardRow());
  els.cancelEdit.addEventListener("click", resetForm);
  els.categoryPicker.addEventListener("change", renderComparison);
  els.catalogSearch?.addEventListener("input", (event) => {
    state.catalogSearch = event.target.value || "";
    renderCatalog();
  });
  els.catalogIssuer?.addEventListener("change", (event) => {
    state.catalogIssuer = event.target.value || "all";
    renderCatalog();
  });
  els.catalogList?.addEventListener("click", async (event) => {
    const addButton = event.target.closest("[data-catalog-add-id]");
    if (!addButton) return;

    const catalogCardId = addButton.getAttribute("data-catalog-add-id");
    if (!catalogCardId) return;
    try {
      await addCatalogCardToWallet(catalogCardId);
    } catch (error) {
      console.error(error);
      setCatalogFeedback(catalogCardId, "error", "Unable to add card right now.");
      renderCatalog();
    }
  });
  els.cardForm.addEventListener("submit", onSubmitCard);
  els.rewardRows.addEventListener("click", (event) => {
    if (event.target.classList.contains("remove-row")) {
      const row = event.target.closest(".reward-row");
      row?.remove();
    }
  });
  els.cardList.addEventListener("click", async (event) => {
    const editId = event.target.getAttribute("data-edit-id");
    if (editId) {
      startEdit(editId);
      return;
    }

    const deleteId = event.target.getAttribute("data-delete-id");
    if (!deleteId) return;

    const deletedCard = state.cards.find((card) => card.id === deleteId);
    await deleteCard(deleteId);
    state.cards = walletCore.removeCatalogWalletCard(state.cards, deleteId);
    if (state.editingCardId === deleteId) {
      resetForm();
    }

    const removedCatalogId = walletCore.getCatalogCardId(deletedCard);
    if (removedCatalogId) {
      const catalogMembership = walletCore.getCatalogMembership(state.cards);
      if (!catalogMembership.has(removedCatalogId)) {
        setCatalogFeedback(removedCatalogId, "info", "Removed from wallet.");
      }
    }

    render();
  });
}

function populateCategoryPickers() {
  const pickerHtml = CATEGORIES.map(
    (cat) => `<option value="${cat.id}">${cat.label}</option>`,
  ).join("");
  els.categoryPicker.innerHTML = pickerHtml;
}

function addRewardRow(category = "other", multiplier = "1") {
  const fragment = els.rewardRowTemplate.content.cloneNode(true);
  const row = fragment.querySelector(".reward-row");
  const categorySelect = row.querySelector(".reward-category");
  const multiplierInput = row.querySelector(".reward-multiplier");

  categorySelect.innerHTML = CATEGORIES.map(
    (cat) => `<option value="${cat.id}">${cat.label}</option>`,
  ).join("");
  categorySelect.value = category;
  multiplierInput.value = String(multiplier);
  els.rewardRows.appendChild(fragment);
}

function populateCatalogIssuerOptions() {
  if (!els.catalogIssuer) return;
  const issuers = catalogCore.getCatalogIssuers(state.catalogCards);
  const options = [
    `<option value="all">All issuers</option>`,
    ...issuers.map((issuer) => `<option value="${escapeHtml(issuer)}">${escapeHtml(issuer)}</option>`),
  ];
  els.catalogIssuer.innerHTML = options.join("");
  els.catalogIssuer.value = state.catalogIssuer || "all";
}

async function onSubmitCard(event) {
  event.preventDefault();
  const name = els.cardName.value.trim();
  const issuer = els.issuer.value.trim();
  const rewards = collectRewards();

  if (!name || rewards.length === 0) {
    return;
  }

  const editingCard = state.cards.find((card) => card.id === state.editingCardId);
  const card = walletCore.normalizeWalletCard({
    id: editingCard?.id || crypto.randomUUID(),
    name,
    issuer,
    rewards,
    createdAt: editingCard?.createdAt || new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    originType: editingCard?.originType,
    origin: editingCard?.origin,
    catalogCardId: editingCard?.catalogCardId,
  });
  if (!card) return;

  await saveCard(card);
  if (editingCard) {
    state.cards = state.cards.map((existing) => (existing.id === card.id ? card : existing));
  } else {
    state.cards.push(card);
  }

  resetForm();
  render();
}

async function addCatalogCardToWallet(catalogCardId) {
  const catalogCard = state.catalogCards.find((entry) => entry.id === catalogCardId);
  if (!catalogCard) return;
  if (walletCore.hasCatalogDuplicate(state.cards, catalogCardId)) {
    setCatalogFeedback(catalogCardId, "info", "Already in wallet.");
    renderCatalog();
    return;
  }

  const walletCard = walletCore.createCatalogWalletCard(catalogCard);
  const nextCards = walletCore.addWalletCard(state.cards, walletCard);
  if (nextCards.length === state.cards.length) {
    setCatalogFeedback(catalogCardId, "info", "Already in wallet.");
    renderCatalog();
    return;
  }

  await saveCard(walletCard);
  state.cards = nextCards;
  setCatalogFeedback(catalogCardId, "success", "Added to wallet.");
  render();
}

function setCatalogFeedback(catalogCardId, type, message) {
  const id = String(catalogCardId || "").trim();
  if (!id) return;

  const existingTimer = catalogFeedbackTimers.get(id);
  if (existingTimer) {
    clearTimeout(existingTimer);
  }

  state.catalogFeedbackById[id] = {
    type,
    message,
  };

  const timeout = setTimeout(() => {
    delete state.catalogFeedbackById[id];
    catalogFeedbackTimers.delete(id);
    renderCatalog();
  }, CATALOG_FEEDBACK_MS);

  catalogFeedbackTimers.set(id, timeout);
}

function collectRewards() {
  const rows = Array.from(els.rewardRows.querySelectorAll(".reward-row"));
  const map = new Map();

  rows.forEach((row) => {
    const category = row.querySelector(".reward-category")?.value;
    const multiplierRaw = row.querySelector(".reward-multiplier")?.value;
    const multiplier = Number(multiplierRaw);
    if (!category || Number.isNaN(multiplier) || multiplier <= 0) return;

    const currentBest = map.get(category) || 0;
    map.set(category, Math.max(multiplier, currentBest));
  });

  return Array.from(map.entries()).map(([category, multiplier]) => ({
    category,
    multiplier,
  }));
}

function render() {
  renderCards();
  renderComparison();
  renderCatalog();
}

function renderCards() {
  els.cardCount.textContent = `${state.cards.length} ${state.cards.length === 1 ? "card" : "cards"}`;
  if (state.cards.length === 0) {
    els.cardList.innerHTML = `<li class="muted">No cards yet. Add one below.</li>`;
    return;
  }

  const html = state.cards
    .slice()
    .sort((a, b) => a.name.localeCompare(b.name))
    .map((card) => {
      const tags = card.rewards
        .map((reward) => formatRewardTag(reward))
        .join("");
      return `
        <li>
          <div class="card-header">
            <div>
              <div class="card-title">${escapeHtml(card.name)}</div>
              <div class="issuer">${escapeHtml(card.issuer || "No issuer")}</div>
            </div>
            <div class="card-actions">
              <button class="secondary" data-edit-id="${card.id}" aria-label="Edit ${escapeHtml(card.name)}">Edit</button>
              <button class="ghost" data-delete-id="${card.id}" aria-label="Delete ${escapeHtml(card.name)}">Delete</button>
            </div>
          </div>
          <div class="tags">${tags}</div>
        </li>
      `;
    })
    .join("");

  els.cardList.innerHTML = html;
}

function renderCatalog() {
  if (!els.catalogList || !els.catalogCount) return;

  const filtered = catalogCore.filterCatalogCards(state.catalogCards, {
    searchTerm: state.catalogSearch,
    issuer: state.catalogIssuer,
  });
  els.catalogCount.textContent = `${filtered.length} ${filtered.length === 1 ? "card" : "cards"}`;

  if (filtered.length === 0) {
    const hasSearch = Boolean(String(state.catalogSearch || "").trim());
    const hasIssuerFilter = String(state.catalogIssuer || "all").toLowerCase() !== "all";
    const emptyMessage = hasSearch || hasIssuerFilter
      ? "No catalog cards match this search/filter. Try clearing search or switching to All issuers."
      : "Catalog is empty. Check back after catalog data is loaded.";
    els.catalogList.innerHTML = `<li class="muted catalog-empty">${escapeHtml(emptyMessage)}</li>`;
    return;
  }

  const html = filtered
    .map((card) => {
      const tags = card.rewards.map((reward) => formatRewardTag(reward)).join("");
      const isAdded = walletCore.catalogCardAlreadyInWallet(state.cards, card.id);
      const addButtonLabel = isAdded ? "Added" : "Add to Wallet";
      const addButtonClass = isAdded
        ? "catalog-add-btn catalog-add-status is-added"
        : "catalog-add-btn catalog-add-status";
      const addButtonAttrs = isAdded
        ? `class="${addButtonClass}" type="button" disabled aria-disabled="true"`
        : `class="${addButtonClass}" type="button" data-catalog-add-id="${escapeHtml(card.id)}"`;
      const feedback = state.catalogFeedbackById[card.id];
      const feedbackMarkup = feedback
        ? `<p class="catalog-feedback ${feedback.type ? `is-${escapeHtml(feedback.type)}` : ""}">${escapeHtml(feedback.message)}</p>`
        : "";
      return `
        <li class="catalog-item">
          <div class="card-header">
            <div>
              <div class="card-title">${escapeHtml(card.name)}</div>
              <div class="issuer">${escapeHtml(card.issuer)}</div>
            </div>
            <div class="catalog-actions">
              <button ${addButtonAttrs}>${addButtonLabel}</button>
            </div>
          </div>
          <div class="tags">${tags}</div>
          ${feedbackMarkup}
        </li>
      `;
    })
    .join("");

  els.catalogList.innerHTML = html;
}

function renderComparison() {
  const category = els.categoryPicker.value || "other";
  const scored = comparisonCore.computeComparisonResults(state.cards, category);
  els.result.classList.remove("result-callout", "result-empty");

  if (state.cards.length === 0) {
    els.result.textContent = "Add at least one card to compare. Use the Add Card form below to get started.";
    els.result.classList.add("muted");
    els.result.classList.add("result-empty");
    els.ranking.innerHTML = `<li class="muted">No cards in wallet yet.</li>`;
    return;
  }

  if (scored.length === 0) {
    els.result.textContent = "No qualifying cards for this category.";
    els.result.classList.add("muted");
    els.result.classList.add("result-empty");
    els.ranking.innerHTML = `<li class="muted">Try a different category or add an 'Everything Else' multiplier.</li>`;
    return;
  }

  const [best] = scored;
  const categoryLabel = CATEGORIES.find((cat) => cat.id === category)?.label || category;
  els.result.classList.remove("muted");
  els.result.classList.add("result-callout");
  els.result.innerHTML = `Best card for <strong>${escapeHtml(categoryLabel)}</strong>: <strong>${escapeHtml(best.card.name)}</strong> at <strong>${comparisonCore.formatMultiplier(best.multiplier)}</strong>.`;

  els.ranking.innerHTML = scored
    .map(
      ({ card, multiplier, source }, idx) => `
      <li class="${idx === 0 ? "best" : ""}">
        <strong>${idx + 1}. ${escapeHtml(card.name)}</strong>
        <span class="muted"> - ${comparisonCore.formatMultiplier(multiplier)} (${escapeHtml(source)})</span>
      </li>`,
    )
    .join("");
}

function formatRewardTag(reward) {
  const label = CATEGORIES.find((cat) => cat.id === reward.category)?.label || reward.category;
  return `<span class="tag">${escapeHtml(label)}: ${comparisonCore.formatMultiplier(reward.multiplier)}</span>`;
}

function escapeHtml(value) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function resetForm() {
  state.editingCardId = null;
  els.cardForm.reset();
  els.formTitle.textContent = "Add Card";
  els.saveCardBtn.textContent = "Save Card";
  els.cancelEdit.hidden = true;
  els.rewardRows.innerHTML = "";
  addRewardRow();
}

function startEdit(cardId) {
  const card = state.cards.find((entry) => entry.id === cardId);
  if (!card) return;

  state.editingCardId = cardId;
  els.formTitle.textContent = "Edit Card";
  els.saveCardBtn.textContent = "Update Card";
  els.cancelEdit.hidden = false;
  els.cardName.value = card.name;
  els.issuer.value = card.issuer || "";
  els.rewardRows.innerHTML = "";
  card.rewards.forEach((reward) => addRewardRow(reward.category, reward.multiplier));
  if (card.rewards.length === 0) {
    addRewardRow();
  }
}

function openDb() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_CARDS)) {
        db.createObjectStore(STORE_CARDS, { keyPath: "id" });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function readCards() {
  const db = await dbPromise;
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_CARDS, "readonly");
    const store = tx.objectStore(STORE_CARDS);
    const request = store.getAll();
    request.onsuccess = () => resolve(request.result || []);
    request.onerror = () => reject(request.error);
  });
}

async function saveCard(card) {
  const db = await dbPromise;
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_CARDS, "readwrite");
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
    tx.objectStore(STORE_CARDS).put(card);
  });
}

async function deleteCard(id) {
  const db = await dbPromise;
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_CARDS, "readwrite");
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
    tx.objectStore(STORE_CARDS).delete(id);
  });
}

async function registerServiceWorker() {
  if (!("serviceWorker" in navigator)) return;
  try {
    await navigator.serviceWorker.register("/sw.js");
  } catch (error) {
    console.error("Service worker registration failed", error);
  }
}
