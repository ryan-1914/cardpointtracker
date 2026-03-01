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

test("uses legacy travel_portal fallback for split portal categories", () => {
  const cards = [
    {
      name: "Legacy Portal Card",
      rewards: [{ category: "travel_portal", multiplier: 5 }],
    },
    {
      name: "Specific Portal Card",
      rewards: [{ category: "travel_portal_flights", multiplier: 4 }],
    },
  ];

  const results = computeComparisonResults(cards, "travel_portal_flights");
  assert.deepEqual(
    results.map((entry) => ({
      name: entry.card.name,
      source: entry.source,
      multiplier: entry.multiplier,
    })),
    [
      { name: "Legacy Portal Card", source: "travel portal fallback", multiplier: 5 },
      { name: "Specific Portal Card", source: "category match", multiplier: 4 },
    ],
  );
});

test("derives travel_portal score from split portal categories when needed", () => {
  const cards = [
    {
      name: "Split Portal Card",
      rewards: [
        { category: "travel_portal_flights", multiplier: 5 },
        { category: "travel_portal_hotels", multiplier: 10 },
      ],
    },
  ];

  const results = computeComparisonResults(cards, "travel_portal");
  assert.deepEqual(
    results.map((entry) => ({
      name: entry.card.name,
      source: entry.source,
      multiplier: entry.multiplier,
    })),
    [
      { name: "Split Portal Card", source: "travel portal derived", multiplier: 10 },
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
