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
      name: "Chase Freedom Unlimited",
      issuer: "Chase",
      network: "Visa",
      rewards: {
        dining: 3,
        drugstore: 3,
        other: 1.5,
      },
    },
    {
      name: "Blue Cash Preferred",
      issuer: "American Express",
      network: "American Express",
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
      network: "Visa",
      rewards: {
        travel: 2,
        other: 2,
      },
    },
    {
      name: "Capital One Savor",
      issuer: "Capital One",
      network: "Mastercard",
      rewards: {
        dining: 3,
        groceries: 3,
        entertainment: 3,
        streaming: 3,
        other: 1,
      },
    },
    {
      name: "Citi Double Cash",
      issuer: "Citi",
      network: "Mastercard",
      rewards: {
        other: 2,
      },
    },
    {
      name: "Citi Strata",
      issuer: "Citi",
      network: "Mastercard",
      rewards: {
        dining: 2,
        groceries: 3,
        gas: 3,
        ev_charging: 3,
        transit: 3,
        other: 1,
      },
    },
    {
      name: "Wells Fargo Autograph",
      issuer: "Wells Fargo",
      network: "Visa",
      rewards: {
        travel: 3,
        transit: 3,
        dining: 3,
        gas: 3,
        streaming: 3,
        phone_plans: 3,
        other: 1,
      },
    },
    {
      name: "Discover it Cash Back",
      issuer: "Discover",
      network: "Discover",
      rewards: {
        groceries: 5,
        wholesale_clubs: 5,
        streaming: 5,
        other: 1,
      },
    },
    {
      name: "U.S. Bank Altitude Go",
      issuer: "U.S. Bank",
      network: "Visa",
      rewards: {
        dining: 4,
        groceries: 2,
        gas: 2,
        ev_charging: 2,
        streaming: 2,
        other: 1,
      },
    },
    {
      name: "U.S. Bank Smartly Visa Signature",
      issuer: "U.S. Bank",
      network: "Visa",
      rewards: {
        other: 2,
      },
    },
    {
      name: "Chase Freedom Flex",
      issuer: "Chase",
      network: "Mastercard",
      rewards: {
        dining: 5,
        drugstore: 3,
        other: 1,
      },
    },
    {
      name: "Capital One Quicksilver",
      issuer: "Capital One",
      network: "Mastercard",
      rewards: {
        other: 1.5,
      },
    },
    {
      name: "Fidelity Rewards Visa Signature Card",
      issuer: "Fidelity",
      network: "Visa",
      rewards: {
        other: 2,
      },
    },
  ];

  const CATALOG_REFERENCE_SEED = [
    { name: "Chase Freedom Unlimited", issuer: "Chase", network: "Visa" },
    { name: "Chase Freedom Flex", issuer: "Chase", network: "Mastercard" },
    { name: "Blue Cash Preferred", issuer: "American Express", network: "Amex" },
    { name: "Capital One Venture X", issuer: "Capital One", network: "Visa" },
    { name: "Capital One Savor", issuer: "Capital One", network: "Mastercard" },
    { name: "Capital One Quicksilver", issuer: "Capital One", network: "Visa" },
    { name: "Citi Double Cash", issuer: "Citi", network: "Mastercard" },
    { name: "Citi Strata", issuer: "Citi", network: "Mastercard" },
    { name: "Wells Fargo Autograph", issuer: "Wells Fargo", network: "Visa" },
    { name: "Discover it Cash Back", issuer: "Discover", network: "Discover" },
    { name: "U.S. Bank Altitude Go", issuer: "U.S. Bank", network: "Visa" },
    { name: "U.S. Bank Smartly Visa Signature", issuer: "U.S. Bank", network: "Visa" },
    { name: "Fidelity Rewards Visa Signature Card", issuer: "Fidelity", network: "Visa" },
  ];

  const CATALOG_PRODUCT_ALIASES = {
    "capital one|venture x rewards": "capital one venture x",
    "capital one|savor rewards": "capital one savor",
    "capital one|quicksilver rewards": "capital one quicksilver",
  };

  const CATALOG_REFERENCE_REWARD_OVERRIDES = {};
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

  function toCatalogProductKey(card) {
    const issuer = String(card?.issuer || "unknown").trim().toLowerCase();
    const name = String(card?.name || "").trim().toLowerCase();
    const rawKey = `${issuer}|${name}`;
    const aliasedName = CATALOG_PRODUCT_ALIASES[rawKey] || name;
    return `${issuer}|${aliasedName}`;
  }

  function getReferenceRewardOverride(card) {
    const issuer = String(card?.issuer || "").trim().toLowerCase();
    const name = String(card?.name || "").trim().toLowerCase();
    const key = `${issuer}|${name}`;
    return CATALOG_REFERENCE_REWARD_OVERRIDES[key];
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
    const network = String(card?.network || "").trim();
    const idSeed = card?.id || `${issuer}-${name || `card-${index + 1}`}`;
    const id = slugify(idSeed) || `catalog-card-${index + 1}`;
    const rewardsInput = card?.rewards || getReferenceRewardOverride(card);
    const rewards = normalizeRewardEntries(rewardsInput);

    return {
      id,
      name: name || `Card ${index + 1}`,
      issuer,
      network,
      rewards,
    };
  }

  function buildCatalogCards(seedCards) {
    const sourceCards = Array.isArray(seedCards)
      ? seedCards
      : [...CATALOG_SEED, ...CATALOG_REFERENCE_SEED];

    const byProduct = new Map();
    sourceCards.forEach((card, index) => {
      const normalized = normalizeCatalogCard(card, index);
      const productKey = toCatalogProductKey(normalized);
      const existing = byProduct.get(productKey);
      if (!existing) {
        byProduct.set(productKey, normalized);
        return;
      }

      if (existing.rewards.length === 0 && normalized.rewards.length > 0) {
        byProduct.set(productKey, normalized);
        return;
      }

    });

    return Array.from(byProduct.values());
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
    CATALOG_REFERENCE_SEED,
  };
});
