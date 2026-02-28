(function (root, factory) {
  const api = factory();

  if (typeof module === "object" && module.exports) {
    module.exports = api;
  }

  if (root) {
    root.CardTrackerWalletCore = api;
  }
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
  const ORIGIN_CATALOG = "catalog";
  const ORIGIN_CUSTOM = "custom";

  function toPositiveNumber(value) {
    const num = Number(value);
    if (!Number.isFinite(num) || num <= 0) {
      return null;
    }

    return num;
  }

  function normalizeRewardEntries(rewardsInput) {
    const entries = Array.isArray(rewardsInput)
      ? rewardsInput
      : Object.entries(rewardsInput || {}).map(([category, multiplier]) => ({
        category,
        multiplier,
      }));

    const byCategory = new Map();
    entries.forEach((entry) => {
      const category = String(entry?.category || "").trim().toLowerCase();
      if (!category) return;

      const multiplier = toPositiveNumber(entry?.multiplier);
      if (!multiplier) return;

      const existing = byCategory.get(category) || 0;
      byCategory.set(category, Math.max(existing, multiplier));
    });

    return Array.from(byCategory.entries())
      .map(([category, multiplier]) => ({ category, multiplier }))
      .sort((left, right) => left.category.localeCompare(right.category));
  }

  function normalizeTimestamp(value, fallback) {
    const text = String(value || "").trim();
    if (!text) return fallback;

    const parsed = Date.parse(text);
    if (Number.isNaN(parsed)) return fallback;

    return new Date(parsed).toISOString();
  }

  function sanitizeText(value, fallback) {
    const text = String(value || "").trim();
    return text || fallback;
  }

  function toCatalogWalletId(catalogCardId) {
    return `catalog-${catalogCardId}`;
  }

  function createCatalogWalletCard(catalogCard, timestamp) {
    const catalogCardId = String(catalogCard?.id || "").trim();
    if (!catalogCardId) {
      throw new Error("Catalog card id is required");
    }

    const now = normalizeTimestamp(timestamp, new Date().toISOString());

    return {
      id: toCatalogWalletId(catalogCardId),
      name: sanitizeText(catalogCard?.name, "Unnamed Card"),
      issuer: sanitizeText(catalogCard?.issuer, "Unknown"),
      rewards: normalizeRewardEntries(catalogCard?.rewards),
      createdAt: now,
      updatedAt: now,
      originType: ORIGIN_CATALOG,
      origin: {
        type: ORIGIN_CATALOG,
        catalogCardId,
      },
      catalogCardId,
    };
  }

  function normalizeWalletCard(card, timestamp) {
    if (!card || typeof card !== "object") return null;

    const now = normalizeTimestamp(timestamp, new Date().toISOString());
    const rewards = normalizeRewardEntries(card.rewards);
    if (rewards.length === 0) return null;

    const cardOriginType = String(card.originType || card.origin?.type || "").trim().toLowerCase();
    const catalogCardId = String(card.catalogCardId || card.origin?.catalogCardId || "").trim();
    const isCatalog = cardOriginType === ORIGIN_CATALOG || Boolean(catalogCardId);

    const createdAt = normalizeTimestamp(card.createdAt, now);
    const updatedAt = normalizeTimestamp(card.updatedAt, createdAt);

    if (isCatalog) {
      const safeCatalogCardId = catalogCardId || String(card.id || "").replace(/^catalog-/, "");
      if (!safeCatalogCardId) return null;

      return {
        id: sanitizeText(card.id, toCatalogWalletId(safeCatalogCardId)),
        name: sanitizeText(card.name, "Unnamed Card"),
        issuer: sanitizeText(card.issuer, "Unknown"),
        rewards,
        createdAt,
        updatedAt,
        originType: ORIGIN_CATALOG,
        origin: {
          type: ORIGIN_CATALOG,
          catalogCardId: safeCatalogCardId,
        },
        catalogCardId: safeCatalogCardId,
      };
    }

    return {
      id: sanitizeText(card.id, `custom-${Date.now()}`),
      name: sanitizeText(card.name, "Unnamed Card"),
      issuer: sanitizeText(card.issuer, "Unknown"),
      rewards,
      createdAt,
      updatedAt,
      originType: ORIGIN_CUSTOM,
      origin: {
        type: ORIGIN_CUSTOM,
      },
    };
  }

  function normalizeWalletCards(cards) {
    return (Array.isArray(cards) ? cards : [])
      .map((card) => normalizeWalletCard(card))
      .filter(Boolean);
  }

  function getCatalogCardId(walletCard) {
    if (!walletCard || typeof walletCard !== "object") return "";

    const directId = String(walletCard.catalogCardId || "").trim();
    if (directId) return directId;

    const originType = String(walletCard.originType || walletCard.origin?.type || "")
      .trim()
      .toLowerCase();

    if (originType !== ORIGIN_CATALOG) return "";

    const originCatalogId = String(walletCard.origin?.catalogCardId || "").trim();
    if (originCatalogId) return originCatalogId;

    const id = String(walletCard.id || "").trim();
    return id.startsWith("catalog-") ? id.replace(/^catalog-/, "") : "";
  }

  function hasCatalogDuplicate(walletCards, catalogCardId) {
    const target = String(catalogCardId || "").trim();
    if (!target) return false;

    return (Array.isArray(walletCards) ? walletCards : []).some(
      (card) => getCatalogCardId(card) === target,
    );
  }

  function addWalletCard(walletCards, walletCard) {
    const normalizedList = normalizeWalletCards(walletCards);
    const normalizedCard = normalizeWalletCard(walletCard);
    if (!normalizedCard) return normalizedList;

    const catalogCardId = getCatalogCardId(normalizedCard);
    if (catalogCardId && hasCatalogDuplicate(normalizedList, catalogCardId)) {
      return normalizedList;
    }

    return [...normalizedList, normalizedCard];
  }

  function removeCatalogWalletCard(walletCards, walletCardId) {
    const targetWalletCardId = String(walletCardId || "").trim();
    if (!targetWalletCardId) {
      return normalizeWalletCards(walletCards);
    }

    return normalizeWalletCards(walletCards).filter((card) => card.id !== targetWalletCardId);
  }

  function getCatalogMembership(walletCards) {
    const membership = new Set();
    normalizeWalletCards(walletCards).forEach((card) => {
      const catalogCardId = getCatalogCardId(card);
      if (!catalogCardId) return;
      membership.add(catalogCardId);
    });

    return membership;
  }

  return {
    ORIGIN_CATALOG,
    ORIGIN_CUSTOM,
    normalizeRewardEntries,
    createCatalogWalletCard,
    normalizeWalletCard,
    normalizeWalletCards,
    getCatalogCardId,
    hasCatalogDuplicate,
    catalogCardAlreadyInWallet: hasCatalogDuplicate,
    addWalletCard,
    removeCatalogWalletCard,
    removeCatalogFromWallet: removeCatalogWalletCard,
    getCatalogMembership,
    toCatalogWalletId,
  };
});
