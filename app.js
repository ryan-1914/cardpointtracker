const CATEGORIES = [
  { id: "dining", label: "Dining / Restaurants" },
  { id: "entertainment", label: "Entertainment" },
  { id: "live_entertainment", label: "Live Entertainment" },
  { id: "fitness", label: "Fitness / Gyms" },
  { id: "groceries", label: "Groceries" },
  { id: "gas", label: "Gas" },
  { id: "ev_charging", label: "EV Charging" },
  { id: "home_improvement", label: "Home Improvement" },
  { id: "utilities", label: "Utilities" },
  { id: "phone_plans", label: "Phone Plans / Telecom" },
  { id: "wholesale_clubs", label: "Wholesale Clubs" },
  { id: "department_stores", label: "Department Stores" },
  { id: "electronics", label: "Electronics" },
  { id: "furniture", label: "Furniture" },
  { id: "clothing", label: "Clothing" },
  { id: "sporting_goods", label: "Sporting Goods" },
  { id: "travel", label: "Travel" },
  { id: "travel_portal_flights", label: "Travel (Portal Flights)" },
  { id: "travel_portal_vacation_rentals", label: "Travel (Portal Vacation Rentals)" },
  { id: "travel_portal_hotels", label: "Travel (Portal Hotels)" },
  { id: "travel_portal_car_rentals", label: "Travel (Portal Car Rentals)" },
  { id: "travel_portal", label: "Travel (Portal Any)" },
  { id: "transit", label: "Transit" },
  { id: "parking_tolls", label: "Parking & Tolls" },
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
  network: document.getElementById("network"),
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
  const normalizedCards = walletCore.normalizeWalletCards(storedCards);
  state.catalogCards = catalogCore.buildCatalogCards();
  const hydratedCards = syncCatalogWalletCards(normalizedCards, state.catalogCards);
  if (walletCardsNeedPersistenceMigration(storedCards, hydratedCards)) {
    await replaceCards(hydratedCards);
  }
  state.cards = hydratedCards;
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
    script.src = "./comparison-core.js";
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
    script.src = "./catalog-core.js";
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
    script.src = "./wallet-core.js";
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
      const cardToEdit = state.cards.find((card) => card.id === editId);
      if (!walletCore.canEditWalletCard(cardToEdit)) {
        resetForm();
        renderCards();
        return;
      }
      startEdit(editId);
      return;
    }

    const deleteId = event.target.getAttribute("data-delete-id");
    if (!deleteId) return;

    const deletedCard = state.cards.find((card) => card.id === deleteId);
    if (!walletCore.canDeleteWalletCard(deletedCard)) {
      return;
    }

    await deleteCard(deleteId);
    state.cards = walletCore.removeWalletCard(state.cards, deleteId);
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

    renderWalletMutationViews();
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
  const network = els.network.value.trim();
  const rewards = collectRewards();

  if (!name || rewards.length === 0) {
    return;
  }

  const editingCard = state.cards.find((card) => card.id === state.editingCardId);
  if (editingCard && !walletCore.canEditWalletCard(editingCard)) {
    resetForm();
    renderWalletMutationViews();
    return;
  }

  const card = walletCore.normalizeWalletCard({
    id: editingCard?.id || crypto.randomUUID(),
    name,
    issuer,
    network,
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
    const updatedCards = state.cards.map((existing) => (existing.id === card.id ? card : existing));
    state.cards = walletCore.normalizeWalletCards(updatedCards);
  } else {
    state.cards = walletCore.addWalletCard(state.cards, card);
  }

  resetForm();
  render();
}

async function addCatalogCardToWallet(catalogCardId) {
  const catalogCard = state.catalogCards.find((entry) => entry.id === catalogCardId);
  if (!catalogCard) return;
  if (!Array.isArray(catalogCard.rewards) || catalogCard.rewards.length === 0) {
    setCatalogFeedback(catalogCardId, "info", "Rewards data unavailable for this card yet.");
    renderCatalog();
    return;
  }
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
  renderWalletMutationViews();
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

function renderWalletMutationViews() {
  renderCards();
  renderCatalog();
  renderComparison();
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
      const originType = walletCore.getWalletOriginType(card);
      const canEdit = walletCore.canEditWalletCard(card);
      const tags = card.rewards
        .map((reward) => formatRewardTag(reward))
        .join("");
      const sourceLabel = originType === walletCore.ORIGIN_CATALOG ? "Catalog" : "Custom";
      const sourceBadge = `<span class="card-source-badge card-source card-source-${originType}">${sourceLabel}</span>`;
      const readonlyBadge = canEdit
        ? ""
        : `<span class="card-readonly-badge is-readonly">Read only</span>`;
      const editButton = canEdit
        ? `<button class="secondary" data-edit-id="${card.id}" aria-label="Edit ${escapeHtml(card.name)}">Edit</button>`
        : "";
      return `
        <li class="card-item card-source-${originType} ${canEdit ? "" : "is-readonly"}">
          <div class="card-header">
            <div>
              <div class="card-title">${escapeHtml(card.name)}</div>
              <div class="issuer-line">
                <div class="issuer">${escapeHtml(formatIssuerAndNetwork(card, "No issuer"))}</div>
                ${sourceBadge}
              </div>
            </div>
            <div class="card-actions">
              ${readonlyBadge}
              ${editButton}
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
      const hasRewards = Array.isArray(card.rewards) && card.rewards.length > 0;
      const tags = card.rewards.map((reward) => formatRewardTag(reward)).join("");
      const isAdded = walletCore.catalogCardAlreadyInWallet(state.cards, card.id);
      const addButtonLabel = isAdded
        ? "Added"
        : (hasRewards ? "Add to Wallet" : "No Rewards Data");
      const addButtonClass = isAdded || !hasRewards
        ? "catalog-add-btn catalog-add-status is-added"
        : "catalog-add-btn catalog-add-status";
      const addButtonAttrs = isAdded || !hasRewards
        ? `class="${addButtonClass}" type="button" disabled aria-disabled="true"`
        : `class="${addButtonClass}" type="button" data-catalog-add-id="${escapeHtml(card.id)}"`;
      const detailsLink = card.link
        ? `<a class="catalog-link" href="${escapeHtml(card.link)}" target="_blank" rel="noopener noreferrer">Official</a>`
        : "";
      const feedback = state.catalogFeedbackById[card.id];
      const feedbackMarkup = feedback
        ? `<p class="catalog-feedback ${feedback.type ? `is-${escapeHtml(feedback.type)}` : ""}">${escapeHtml(feedback.message)}</p>`
        : "";
      const rewardsMarkup = hasRewards
        ? `<div class="tags">${tags}</div>`
        : `<div class="tags"><span class="tag tag-muted">Rewards data coming soon</span></div>`;
      return `
        <li class="catalog-item">
          <div class="card-header">
            <div>
              <div class="card-title">${escapeHtml(card.name)}</div>
              <div class="issuer">${escapeHtml(formatIssuerAndNetwork(card, "Unknown"))}</div>
            </div>
            <div class="catalog-actions">
              ${detailsLink}
              <button ${addButtonAttrs}>${addButtonLabel}</button>
            </div>
          </div>
          ${rewardsMarkup}
          ${feedbackMarkup}
        </li>
      `;
    })
    .join("");

  els.catalogList.innerHTML = html;
}

function renderComparison() {
  const category = els.categoryPicker.value || "other";
  const comparisonCards = walletCore.normalizeWalletCards(state.cards);
  const scored = comparisonCore.computeComparisonResults(comparisonCards, category);
  els.result.classList.remove("result-callout", "result-empty");

  if (comparisonCards.length === 0) {
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

function formatIssuerAndNetwork(card, fallback) {
  const issuer = String(card?.issuer || "").trim();
  const network = String(card?.network || "").trim();

  if (issuer && network) {
    return `${issuer} • ${network}`;
  }

  return issuer || network || fallback;
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
  if (!card || !walletCore.canEditWalletCard(card)) return;

  state.editingCardId = cardId;
  els.formTitle.textContent = "Edit Card";
  els.saveCardBtn.textContent = "Update Card";
  els.cancelEdit.hidden = false;
  els.cardName.value = card.name;
  els.issuer.value = card.issuer || "";
  els.network.value = card.network || "";
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

function walletCardsNeedPersistenceMigration(storedCards, normalizedCards) {
  const raw = Array.isArray(storedCards) ? storedCards : [];
  return JSON.stringify(raw) !== JSON.stringify(normalizedCards);
}

function syncCatalogWalletCards(cards, catalogCards) {
  const catalogById = new Map(
    (Array.isArray(catalogCards) ? catalogCards : []).map((catalogCard) => [catalogCard.id, catalogCard]),
  );

  return walletCore.normalizeWalletCards(cards).map((card) => {
    const catalogCardId = walletCore.getCatalogCardId(card);
    if (!catalogCardId) return card;

    const catalogCard = catalogById.get(catalogCardId);
    if (!catalogCard) return card;

    const nextCard = walletCore.normalizeWalletCard({
      ...card,
      name: catalogCard.name || card.name,
      issuer: catalogCard.issuer || card.issuer,
      network: catalogCard.network || card.network,
      rewards: Array.isArray(catalogCard.rewards) && catalogCard.rewards.length > 0
        ? catalogCard.rewards
        : card.rewards,
      createdAt: card.createdAt,
      updatedAt: card.updatedAt,
      originType: card.originType,
      origin: card.origin,
      catalogCardId: card.catalogCardId,
    });

    if (!nextCard) return card;
    if (JSON.stringify(nextCard) === JSON.stringify(card)) return card;
    return nextCard;
  }).filter(Boolean);
}

async function replaceCards(cards) {
  const db = await dbPromise;
  const safeCards = walletCore.normalizeWalletCards(cards);

  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_CARDS, "readwrite");
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);

    const store = tx.objectStore(STORE_CARDS);
    store.clear();
    safeCards.forEach((card) => {
      store.put(card);
    });
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
    await navigator.serviceWorker.register("./sw.js");
  } catch (error) {
    console.error("Service worker registration failed", error);
  }
}
