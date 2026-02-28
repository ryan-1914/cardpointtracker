import test from "node:test";
import assert from "node:assert/strict";

import comparisonCore from "../comparison-core.js";

const { computeComparisonResults, formatMultiplier } = comparisonCore;

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
