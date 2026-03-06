import test from "node:test";
import assert from "node:assert/strict";

import comparisonCore from "../comparison-core.js";
import walletCore from "../wallet-core.js";

const { computeComparisonResults, formatMultiplier } = comparisonCore;
const { createCatalogWalletCard, normalizeWalletCard } = walletCore;

test("sorts by multiplier descending and name ascending for ties", () => {
  const cards = [
    {
      name: "Zeta Rewards",
      rewards: [{ category: "dining", multiplier: 3 }],
    },
    {
      name: "Alpha Rewards",
      rewards: [{ category: "dining", multiplier: 3 }],
    },
    {
      name: "Beta Rewards",
      rewards: [{ category: "dining", multiplier: 2 }],
    },
  ];

  const results = computeComparisonResults(cards, "dining");
  assert.deepEqual(results.map((entry) => entry.card.name), [
    "Alpha Rewards",
    "Zeta Rewards",
    "Beta Rewards",
  ]);
  assert.ok(results.every((entry) => entry.source === "category match"));
});

test("uses other fallback and excludes non-qualifying cards", () => {
  const cards = [
    {
      name: "Direct Match",
      rewards: [{ category: "groceries", multiplier: 4 }],
    },
    {
      name: "Fallback Card",
      rewards: [{ category: "other", multiplier: 2 }],
    },
    {
      name: "No Match",
      rewards: [{ category: "travel", multiplier: 3 }],
    },
  ];

  const results = computeComparisonResults(cards, "groceries");
  assert.equal(results.length, 2);
  assert.deepEqual(
    results.map((entry) => ({
      name: entry.card.name,
      source: entry.source,
      multiplier: entry.multiplier,
    })),
    [
      { name: "Direct Match", source: "category match", multiplier: 4 },
      { name: "Fallback Card", source: "other fallback", multiplier: 2 },
    ],
  );
});

test("uses direct category matches before fallback for non-specialized categories", () => {
  const cards = [
    {
      name: "Direct Match",
      rewards: [{ category: "travel", multiplier: 5 }],
    },
    {
      name: "Fallback Card",
      rewards: [{ category: "other", multiplier: 4 }],
    },
  ];

  const results = computeComparisonResults(cards, "travel");
  assert.deepEqual(
    results.map((entry) => ({
      name: entry.card.name,
      source: entry.source,
      multiplier: entry.multiplier,
    })),
    [
      { name: "Direct Match", source: "category match", multiplier: 5 },
      { name: "Fallback Card", source: "other fallback", multiplier: 4 },
    ],
  );
});

test("treats unknown categories like any other non-match", () => {
  const cards = [
    {
      name: "Fallback Card",
      rewards: [{ category: "other", multiplier: 2 }],
    },
  ];

  const results = computeComparisonResults(cards, "legacy_portal");
  assert.deepEqual(
    results.map((entry) => ({
      name: entry.card.name,
      source: entry.source,
      multiplier: entry.multiplier,
    })),
    [
      { name: "Fallback Card", source: "other fallback", multiplier: 2 },
    ],
  );
});

test("produces deterministic order for identical input", () => {
  const cards = [
    {
      name: "Card C",
      rewards: [{ category: "gas", multiplier: 1.5 }],
    },
    {
      name: "Card A",
      rewards: [{ category: "gas", multiplier: 1.5 }],
    },
    {
      name: "Card B",
      rewards: [{ category: "other", multiplier: 1.5 }],
    },
  ];

  const first = computeComparisonResults(cards, "gas");
  const second = computeComparisonResults(cards, "gas");

  assert.deepEqual(
    first.map((entry) => `${entry.card.name}:${entry.multiplier}:${entry.source}`),
    second.map((entry) => `${entry.card.name}:${entry.multiplier}:${entry.source}`),
  );
});

test("formats multipliers by trimming unnecessary trailing zeros", () => {
  assert.equal(formatMultiplier(2), "2x");
  assert.equal(formatMultiplier(1.5), "1.5x");
  assert.equal(formatMultiplier("2.0"), "2x");
});

test("mixed wallet ranking remains deterministic after custom create/edit/delete mutations", () => {
  const catalogTravel = createCatalogWalletCard(
    {
      id: "capital-one-venture-x",
      name: "Capital One Venture X",
      issuer: "Capital One",
      rewards: [{ category: "travel", multiplier: 2 }],
    },
    "2026-02-28T16:10:00.000Z",
  );
  const customAlpha = normalizeWalletCard({
    id: "custom-alpha",
    name: "Alpha Custom",
    rewards: [{ category: "travel", multiplier: 3 }],
  });
  const customBeta = normalizeWalletCard({
    id: "custom-beta",
    name: "Beta Custom",
    rewards: [{ category: "travel", multiplier: 4 }],
  });
  const customAlphaEdited = normalizeWalletCard({
    id: "custom-alpha",
    name: "Alpha Custom Plus",
    rewards: [{ category: "travel", multiplier: 5 }],
    createdAt: customAlpha?.createdAt,
  });

  const afterCreate = [catalogTravel, customAlpha, customBeta];
  const afterEdit = afterCreate.map((card) => (card.id === customAlphaEdited?.id ? customAlphaEdited : card));
  const afterDelete = afterEdit.filter((card) => card.id !== "custom-beta");
  const catalogOnly = afterDelete.filter((card) => card.id !== "custom-alpha");

  assert.deepEqual(
    computeComparisonResults([catalogTravel, customAlpha], "travel").map((entry) => entry.card.name),
    ["Alpha Custom", "Capital One Venture X"],
  );
  assert.deepEqual(
    computeComparisonResults(afterCreate, "travel").map((entry) => entry.card.name),
    ["Beta Custom", "Alpha Custom", "Capital One Venture X"],
  );
  assert.deepEqual(
    computeComparisonResults(afterEdit, "travel").map((entry) => entry.card.name),
    ["Alpha Custom Plus", "Beta Custom", "Capital One Venture X"],
  );
  assert.deepEqual(
    computeComparisonResults(afterDelete, "travel").map((entry) => entry.card.name),
    ["Alpha Custom Plus", "Capital One Venture X"],
  );
  assert.deepEqual(
    computeComparisonResults(catalogOnly, "travel").map((entry) => entry.card.name),
    ["Capital One Venture X"],
  );
});

test("equivalent custom and catalog category matches stay source-neutral under deterministic tie-breaking", () => {
  const catalogCard = createCatalogWalletCard(
    {
      id: "parity-plus",
      name: "Parity Plus",
      issuer: "Catalog Bank",
      rewards: [{ category: "dining", multiplier: 3 }],
    },
    "2026-03-05T10:00:00.000Z",
  );
  const customCard = normalizeWalletCard({
    id: "custom-parity-plus",
    name: "Parity Plus",
    issuer: "Local CU",
    rewards: [{ category: "dining", multiplier: 3 }],
  });

  const forward = computeComparisonResults([catalogCard, customCard], "dining");
  const reverse = computeComparisonResults([customCard, catalogCard], "dining");

  assert.deepEqual(
    forward.map((entry) => ({
      id: entry.card.id,
      name: entry.card.name,
      multiplier: entry.multiplier,
      source: entry.source,
    })),
    [
      {
        id: "catalog-parity-plus",
        name: "Parity Plus",
        multiplier: 3,
        source: "category match",
      },
      {
        id: "custom-parity-plus",
        name: "Parity Plus",
        multiplier: 3,
        source: "category match",
      },
    ],
  );
  assert.deepEqual(
    reverse.map((entry) => ({
      id: entry.card.id,
      name: entry.card.name,
      multiplier: entry.multiplier,
      source: entry.source,
    })),
    forward.map((entry) => ({
      id: entry.card.id,
      name: entry.card.name,
      multiplier: entry.multiplier,
      source: entry.source,
    })),
  );
});

test("equivalent custom and catalog other fallback cards share deterministic fallback semantics", () => {
  const catalogCard = createCatalogWalletCard(
    {
      id: "fallback-parity",
      name: "Fallback Parity",
      issuer: "Catalog Bank",
      rewards: [{ category: "other", multiplier: 2 }],
    },
    "2026-03-05T10:01:00.000Z",
  );
  const customCard = normalizeWalletCard({
    id: "custom-fallback-parity",
    name: "Fallback Parity",
    issuer: "Local CU",
    rewards: [{ category: "other", multiplier: 2 }],
  });

  const forward = computeComparisonResults([customCard, catalogCard], "streaming");
  const reverse = computeComparisonResults([catalogCard, customCard], "streaming");

  assert.deepEqual(
    forward.map((entry) => ({
      id: entry.card.id,
      source: entry.source,
      multiplier: entry.multiplier,
    })),
    [
      {
        id: "catalog-fallback-parity",
        source: "other fallback",
        multiplier: 2,
      },
      {
        id: "custom-fallback-parity",
        source: "other fallback",
        multiplier: 2,
      },
    ],
  );
  assert.deepEqual(
    reverse.map((entry) => ({
      id: entry.card.id,
      source: entry.source,
      multiplier: entry.multiplier,
    })),
    forward.map((entry) => ({
      id: entry.card.id,
      source: entry.source,
      multiplier: entry.multiplier,
    })),
  );
});

test("mixed direct matches and fallback cards still rank by multiplier before alphabetical tie-breaking", () => {
  const cards = [
    normalizeWalletCard({
      id: "custom-fallback-zeta",
      name: "Zeta Fallback",
      rewards: [{ category: "other", multiplier: 3 }],
    }),
    createCatalogWalletCard(
      {
        id: "alpha-direct",
        name: "Alpha Direct",
        issuer: "Catalog Bank",
        rewards: [{ category: "groceries", multiplier: 4 }],
      },
      "2026-03-05T10:02:00.000Z",
    ),
    normalizeWalletCard({
      id: "custom-beta-direct",
      name: "Beta Direct",
      rewards: [{ category: "groceries", multiplier: 4 }],
    }),
    createCatalogWalletCard(
      {
        id: "gamma-fallback",
        name: "Gamma Fallback",
        issuer: "Catalog Bank",
        rewards: [{ category: "other", multiplier: 2 }],
      },
      "2026-03-05T10:03:00.000Z",
    ),
  ];

  assert.deepEqual(
    computeComparisonResults(cards, "groceries").map((entry) => ({
      name: entry.card.name,
      multiplier: entry.multiplier,
      source: entry.source,
    })),
    [
      { name: "Alpha Direct", multiplier: 4, source: "category match" },
      { name: "Beta Direct", multiplier: 4, source: "category match" },
      { name: "Zeta Fallback", multiplier: 3, source: "other fallback" },
      { name: "Gamma Fallback", multiplier: 2, source: "other fallback" },
    ],
  );
});
