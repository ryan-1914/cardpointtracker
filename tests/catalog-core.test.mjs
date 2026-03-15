import test from "node:test";
import assert from "node:assert/strict";

import catalogCore from "../catalog-core.js";

const {
  buildCatalogCards,
  normalizeCatalogCard,
  normalizeRewardEntries,
  getCatalogIssuers,
  filterCatalogCards,
} = catalogCore;

const EXPECTED_CATALOG_NAMES = [
  "Blue Cash Preferred",
  "Capital One Quicksilver",
  "Capital One Savor",
  "Capital One Venture X",
  "Chase Freedom Flex",
  "Chase Freedom Unlimited",
  "Citi Double Cash",
  "Citi Strata",
  "Discover it Cash Back",
  "Fidelity Rewards Visa Signature Card",
  "U.S. Bank Altitude Go",
  "U.S. Bank Smartly Visa Signature",
  "Wells Fargo Autograph",
];

test("buildCatalogCards returns normalized entries for the curated catalog", () => {
  const cards = buildCatalogCards();
  assert.equal(cards.length, EXPECTED_CATALOG_NAMES.length);
  assert.deepEqual(
    cards.map((card) => card.name).sort((left, right) => left.localeCompare(right)),
    EXPECTED_CATALOG_NAMES,
  );

  cards.forEach((card) => {
    assert.ok(card.id);
    assert.ok(card.name);
    assert.ok(card.issuer);
    assert.ok(card.network);
    assert.ok(Array.isArray(card.rewards));

    card.rewards.forEach((reward) => {
      assert.ok(reward.category);
      assert.ok(Number.isFinite(reward.multiplier));
      assert.ok(reward.multiplier > 0);
    });
  });
});

test("normalizeRewardEntries deduplicates categories and keeps highest multiplier", () => {
  const rewards = normalizeRewardEntries([
    { category: "dining", multiplier: 3 },
    { category: "dining", multiplier: 4 },
    { category: "gas", multiplier: "2" },
    { category: "gas", multiplier: -1 },
    { category: "", multiplier: 10 },
    { category: "other", multiplier: "oops" },
  ]);

  assert.deepEqual(rewards, [
    { category: "dining", multiplier: 4 },
    { category: "gas", multiplier: 2 },
  ]);
});

test("normalizeCatalogCard creates deterministic id and normalized fields", () => {
  const card = normalizeCatalogCard(
    {
      name: "  Test Card  ",
      issuer: "  Test Bank ",
      network: "  Visa ",
      rewards: {
        groceries: 3,
      },
    },
    0,
  );

  assert.equal(card.id, "test-bank-test-card");
  assert.equal(card.name, "Test Card");
  assert.equal(card.issuer, "Test Bank");
  assert.equal(card.network, "Visa");
  assert.deepEqual(card.rewards, [{ category: "groceries", multiplier: 3 }]);
});

test("getCatalogIssuers returns unique sorted issuers", () => {
  const issuers = getCatalogIssuers(buildCatalogCards());
  assert.deepEqual(issuers, [
    "American Express",
    "Capital One",
    "Chase",
    "Citi",
    "Discover",
    "Fidelity",
    "U.S. Bank",
    "Wells Fargo",
  ]);
});

test("filterCatalogCards narrows by case-insensitive name search", () => {
  const cards = buildCatalogCards();
  const results = filterCatalogCards(cards, { searchTerm: "freedom", issuer: "all" });

  assert.deepEqual(
    results.map((card) => card.name),
    ["Chase Freedom Flex", "Chase Freedom Unlimited"],
  );
});

test("filterCatalogCards combines issuer and search filters", () => {
  const cards = buildCatalogCards();
  const chaseFreedom = filterCatalogCards(cards, {
    issuer: "chase",
    searchTerm: "freedom",
  });

  assert.deepEqual(
    chaseFreedom.map((card) => card.name),
    ["Chase Freedom Flex", "Chase Freedom Unlimited"],
  );

  const noMatches = filterCatalogCards(cards, {
    issuer: "Discover",
    searchTerm: "Freedom",
  });
  assert.equal(noMatches.length, 0);
});

test("filterCatalogCards treats issuer matching as case-insensitive exact match", () => {
  const cards = buildCatalogCards();
  const lower = filterCatalogCards(cards, { issuer: "american express", searchTerm: "" });
  const spaced = filterCatalogCards(cards, { issuer: "  American Express  ", searchTerm: "" });

  assert.deepEqual(
    lower.map((card) => card.name),
    spaced.map((card) => card.name),
  );
  assert.ok(lower.length > 0);
  assert.ok(lower.every((card) => card.issuer === "American Express"));
});

test("filterCatalogCards recovers the full catalog after a no-match mobile filter state clears", () => {
  const cards = buildCatalogCards();
  const noMatches = filterCatalogCards(cards, {
    issuer: "Chase",
    searchTerm: "venture x",
  });
  const resetResults = filterCatalogCards(cards, {
    issuer: "all",
    searchTerm: "",
  });

  assert.equal(noMatches.length, 0);
  assert.equal(resetResults.length, cards.length);
  assert.deepEqual(
    resetResults.map((card) => card.name).sort((left, right) => left.localeCompare(right)),
    cards.map((card) => card.name).sort((left, right) => left.localeCompare(right)),
  );
});

test("buildCatalogCards collapses known near-duplicate product aliases", () => {
  const cards = buildCatalogCards([
    { name: "Capital One Venture X", issuer: "Capital One", network: "Visa", rewards: { travel: 2 } },
    { name: "Venture X Rewards", issuer: "Capital One", network: "Visa", rewards: { other: 2 } },
    { name: "Capital One Savor", issuer: "Capital One", network: "Mastercard", rewards: { dining: 3 } },
    { name: "Savor Rewards", issuer: "Capital One", network: "Mastercard", rewards: { groceries: 3 } },
    { name: "Capital One Quicksilver", issuer: "Capital One", network: "Mastercard", rewards: { other: 1.5 } },
    { name: "Quicksilver Rewards", issuer: "Capital One", network: "Mastercard", rewards: { other: 1.5 } },
  ]);
  const names = new Set(cards.map((card) => card.name));

  assert.equal(names.has("Capital One Venture X"), true);
  assert.equal(names.has("Venture X Rewards"), false);

  assert.equal(names.has("Capital One Savor"), true);
  assert.equal(names.has("Savor Rewards"), false);

  assert.equal(names.has("Capital One Quicksilver"), true);
  assert.equal(names.has("Quicksilver Rewards"), false);
});

test("buildCatalogCards keeps expected rewards for curated cards", () => {
  const cards = buildCatalogCards();
  const byName = new Map(cards.map((card) => [card.name, card]));

  const blueCashPreferred = byName.get("Blue Cash Preferred");
  assert.ok(blueCashPreferred);
  assert.deepEqual(blueCashPreferred.rewards, [
    { category: "gas", multiplier: 3 },
    { category: "groceries", multiplier: 6 },
    { category: "other", multiplier: 1 },
    { category: "streaming", multiplier: 6 },
    { category: "transit", multiplier: 3 },
  ]);

  const ventureX = byName.get("Capital One Venture X");
  assert.ok(ventureX);
  assert.deepEqual(ventureX.rewards, [
    { category: "other", multiplier: 2 },
    { category: "travel", multiplier: 2 },
  ]);

  const savor = byName.get("Capital One Savor");
  assert.ok(savor);
  assert.deepEqual(savor.rewards, [
    { category: "dining", multiplier: 3 },
    { category: "entertainment", multiplier: 3 },
    { category: "groceries", multiplier: 3 },
    { category: "other", multiplier: 1 },
    { category: "streaming", multiplier: 3 },
  ]);

  const freedomUnlimited = byName.get("Chase Freedom Unlimited");
  assert.ok(freedomUnlimited);
  assert.deepEqual(freedomUnlimited.rewards, [
    { category: "dining", multiplier: 3 },
    { category: "drugstore", multiplier: 3 },
    { category: "other", multiplier: 1.5 },
  ]);

  const freedomFlex = byName.get("Chase Freedom Flex");
  assert.ok(freedomFlex);
  assert.deepEqual(freedomFlex.rewards, [
    { category: "dining", multiplier: 5 },
    { category: "drugstore", multiplier: 3 },
    { category: "other", multiplier: 1 },
  ]);

  const doubleCash = byName.get("Citi Double Cash");
  assert.ok(doubleCash);
  assert.deepEqual(doubleCash.rewards, [{ category: "other", multiplier: 2 }]);

  const strata = byName.get("Citi Strata");
  assert.ok(strata);
  assert.deepEqual(strata.rewards, [
    { category: "dining", multiplier: 2 },
    { category: "ev_charging", multiplier: 3 },
    { category: "gas", multiplier: 3 },
    { category: "groceries", multiplier: 3 },
    { category: "other", multiplier: 1 },
    { category: "transit", multiplier: 3 },
  ]);

  const discoverItCashBack = byName.get("Discover it Cash Back");
  assert.ok(discoverItCashBack);
  assert.deepEqual(discoverItCashBack.rewards, [
    { category: "groceries", multiplier: 5 },
    { category: "other", multiplier: 1 },
    { category: "streaming", multiplier: 5 },
    { category: "wholesale_clubs", multiplier: 5 },
  ]);

  const altitudeGo = byName.get("U.S. Bank Altitude Go");
  assert.ok(altitudeGo);
  assert.deepEqual(altitudeGo.rewards, [
    { category: "dining", multiplier: 4 },
    { category: "ev_charging", multiplier: 2 },
    { category: "gas", multiplier: 2 },
    { category: "groceries", multiplier: 2 },
    { category: "other", multiplier: 1 },
    { category: "streaming", multiplier: 2 },
  ]);

  const autograph = byName.get("Wells Fargo Autograph");
  assert.ok(autograph);
  assert.deepEqual(autograph.rewards, [
    { category: "dining", multiplier: 3 },
    { category: "gas", multiplier: 3 },
    { category: "other", multiplier: 1 },
    { category: "phone_plans", multiplier: 3 },
    { category: "streaming", multiplier: 3 },
    { category: "transit", multiplier: 3 },
    { category: "travel", multiplier: 3 },
  ]);

  const usBankSmartly = byName.get("U.S. Bank Smartly Visa Signature");
  assert.ok(usBankSmartly);
  assert.deepEqual(usBankSmartly.rewards, [{ category: "other", multiplier: 2 }]);

  const quicksilver = byName.get("Capital One Quicksilver");
  assert.ok(quicksilver);
  assert.deepEqual(quicksilver.rewards, [{ category: "other", multiplier: 1.5 }]);

  const fidelityRewardsVisa = byName.get("Fidelity Rewards Visa Signature Card");
  assert.ok(fidelityRewardsVisa);
  assert.deepEqual(fidelityRewardsVisa.rewards, [{ category: "other", multiplier: 2 }]);
});
