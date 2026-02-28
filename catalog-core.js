(function (root, factory) {
  const api = factory();

  if (typeof module === "object" && module.exports) {
    module.exports = api;
  }

  if (root) {
    root.CardTrackerCatalogCore = api;
  }
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
  const CATALOG_SEED = [
    {
      name: "Chase Sapphire Preferred",
      issuer: "Chase",
      rewards: {
        travel: 2,
        dining: 3,
        streaming: 3,
        online: 3,
        other: 1,
      },
    },
    {
      name: "Chase Sapphire Reserve",
      issuer: "Chase",
      rewards: {
        travel: 3,
        dining: 3,
        other: 1,
      },
    },
    {
      name: "Chase Freedom Unlimited",
      issuer: "Chase",
      rewards: {
        dining: 3,
        drugstore: 3,
        travel: 5,
        other: 1.5,
      },
    },
    {
      name: "American Express Gold Card",
      issuer: "American Express",
      rewards: {
        dining: 4,
        groceries: 4,
        travel: 3,
        other: 1,
      },
    },
    {
      name: "Blue Cash Preferred",
      issuer: "American Express",
      rewards: {
        groceries: 6,
        streaming: 6,
        transit: 3,
        gas: 3,
        other: 1,
      },
    },
    {
      name: "Capital One Venture X",
      issuer: "Capital One",
      rewards: {
        travel: 2,
        other: 2,
      },
    },
    {
      name: "Capital One Savor",
      issuer: "Capital One",
      rewards: {
        dining: 3,
        groceries: 3,
        streaming: 3,
        online: 3,
        other: 1,
      },
    },
    {
      name: "Citi Double Cash",
      issuer: "Citi",
      rewards: {
        other: 2,
      },
    },
    {
      name: "Citi Custom Cash",
      issuer: "Citi",
      rewards: {
        groceries: 5,
        dining: 5,
        gas: 5,
        transit: 5,
        travel: 5,
        streaming: 5,
        drugstore: 5,
        other: 1,
      },
    },
    {
      name: "Wells Fargo Autograph",
      issuer: "Wells Fargo",
      rewards: {
        travel: 3,
        transit: 3,
        dining: 3,
        gas: 3,
        streaming: 3,
        other: 1,
      },
    },
    {
      name: "Discover it Cash Back",
      issuer: "Discover",
      rewards: {
        groceries: 5,
        gas: 5,
        online: 5,
        dining: 5,
        other: 1,
      },
    },
    {
      name: "Bank of America Customized Cash Rewards",
      issuer: "Bank of America",
      rewards: {
        gas: 3,
        online: 3,
        dining: 2,
        groceries: 2,
        other: 1,
      },
    },
    {
      name: "U.S. Bank Altitude Go",
      issuer: "U.S. Bank",
      rewards: {
        dining: 4,
        groceries: 2,
        gas: 2,
        streaming: 2,
        other: 1,
      },
    },
  ];

  function slugify(value) {
    return String(value || "")
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .replace(/-{2,}/g, "-");
  }

  function toPositiveNumber(value) {
    const num = Number(value);
    if (!Number.isFinite(num) || num <= 0) {
      return null;
    }
    return num;
  }

  function normalizeRewardEntries(rewardsInput) {
    const pairs = Array.isArray(rewardsInput)
      ? rewardsInput.map((entry) => [entry?.category, entry?.multiplier])
      : Object.entries(rewardsInput || {});

    const bestByCategory = new Map();
    pairs.forEach(([rawCategory, rawMultiplier]) => {
      const category = String(rawCategory || "").trim().toLowerCase();
      if (!category) return;

      const multiplier = toPositiveNumber(rawMultiplier);
      if (!multiplier) return;

      const existing = bestByCategory.get(category) || 0;
      bestByCategory.set(category, Math.max(existing, multiplier));
    });

    return Array.from(bestByCategory.entries())
      .map(([category, multiplier]) => ({ category, multiplier }))
      .sort((left, right) => left.category.localeCompare(right.category));
  }

  function normalizeCatalogCard(card, index) {
    const name = String(card?.name || "").trim();
    const issuer = String(card?.issuer || "Unknown").trim() || "Unknown";
    const idSeed = card?.id || `${issuer}-${name || `card-${index + 1}`}`;
    const id = slugify(idSeed) || `catalog-card-${index + 1}`;
    const rewards = normalizeRewardEntries(card?.rewards);

    return {
      id,
      name: name || `Card ${index + 1}`,
      issuer,
      rewards,
    };
  }

  function buildCatalogCards(seedCards) {
    return (Array.isArray(seedCards) ? seedCards : CATALOG_SEED)
      .map((card, index) => normalizeCatalogCard(card, index))
      .filter((card) => card.rewards.length > 0);
  }

  function getCatalogIssuers(cards) {
    const unique = new Set(
      (Array.isArray(cards) ? cards : [])
        .map((card) => String(card?.issuer || "").trim())
        .filter(Boolean),
    );

    return Array.from(unique).sort((left, right) => left.localeCompare(right));
  }

  function filterCatalogCards(cards, criteria) {
    const searchTerm = String(criteria?.searchTerm || "").trim().toLowerCase();
    const issuer = String(criteria?.issuer || "all").trim();
    const issuerLower = issuer.toLowerCase();

    return (Array.isArray(cards) ? cards : [])
      .filter((card) => {
        if (issuerLower !== "all") {
          const cardIssuer = String(card?.issuer || "").trim().toLowerCase();
          if (cardIssuer !== issuerLower) return false;
        }

        if (!searchTerm) return true;
        return String(card?.name || "").toLowerCase().includes(searchTerm);
      })
      .slice()
      .sort((left, right) => left.name.localeCompare(right.name));
  }

  return {
    CATALOG_SEED,
    buildCatalogCards,
    normalizeCatalogCard,
    normalizeRewardEntries,
    getCatalogIssuers,
    filterCatalogCards,
  };
});
