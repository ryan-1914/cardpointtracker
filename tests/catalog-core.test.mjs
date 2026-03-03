import test from "node:test";
import assert from "node:assert/strict";

import catalogCore from "../catalog-core.js";

const {
  CATALOG_SEED,
  CATALOG_REFERENCE_SEED,
  buildCatalogCards,
  normalizeCatalogCard,
  normalizeRewardEntries,
  getCatalogIssuers,
  filterCatalogCards,
} = catalogCore;

test("buildCatalogCards returns normalized fixed catalog entries", () => {
  const cards = buildCatalogCards();
  assert.ok(cards.length > CATALOG_SEED.length);
  assert.ok(cards.length <= CATALOG_SEED.length + CATALOG_REFERENCE_SEED.length);

  const withRewards = cards.filter((card) => card.rewards.length > 0);
  const withoutRewards = cards.filter((card) => card.rewards.length === 0);
  assert.ok(withRewards.length >= CATALOG_SEED.length);
  assert.equal(withoutRewards.length, 0);

  cards.forEach((card) => {
    assert.ok(card.id);
    assert.ok(card.name);
    assert.ok(card.issuer);
    assert.ok(card.network);
    assert.ok(Array.isArray(card.rewards));
    assert.ok(typeof card.link === "string");
    if (card.link) {
      assert.ok(card.link.startsWith("https://") || card.link.startsWith("http://"));
    }

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
      link: "https://example.com/card",
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
  assert.equal(card.link, "https://example.com/card");
  assert.deepEqual(card.rewards, [{ category: "groceries", multiplier: 3 }]);
});

test("getCatalogIssuers returns unique sorted issuers", () => {
  const issuers = getCatalogIssuers(buildCatalogCards());
  assert.equal(issuers[0], "American Express");
  assert.ok(issuers.includes("Chase"));
  assert.ok(issuers.includes("Citi"));
  assert.equal(new Set(issuers).size, issuers.length);
});

test("filterCatalogCards narrows by case-insensitive name search", () => {
  const cards = buildCatalogCards();
  const results = filterCatalogCards(cards, { searchTerm: "sapphire", issuer: "all" });

  assert.ok(results.length >= 2);
  assert.ok(results.every((card) => card.name.toLowerCase().includes("sapphire")));
});

test("filterCatalogCards combines issuer and search filters", () => {
  const cards = buildCatalogCards();
  const chaseSapphire = filterCatalogCards(cards, {
    issuer: "chase",
    searchTerm: "sapphire",
  });

  assert.ok(chaseSapphire.length >= 1);
  assert.ok(
    chaseSapphire.every(
      (card) =>
        card.issuer.toLowerCase() === "chase" &&
        card.name.toLowerCase().includes("sapphire"),
    ),
  );

  const noMatches = filterCatalogCards(cards, {
    issuer: "Discover",
    searchTerm: "Sapphire",
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

test("buildCatalogCards collapses known near-duplicate product aliases", () => {
  const cards = buildCatalogCards();
  const names = new Set(cards.map((card) => card.name));

  assert.equal(names.has("Capital One Venture X"), true);
  assert.equal(names.has("Venture X Rewards"), false);

  assert.equal(names.has("Capital One Savor"), true);
  assert.equal(names.has("Savor Rewards"), false);

  assert.equal(names.has("Capital One Quicksilver"), true);
  assert.equal(names.has("Quicksilver Rewards"), false);

  assert.equal(names.has("Amazon Prime Visa"), true);
  assert.equal(names.has("Prime Visa"), false);

  assert.equal(names.has("Bank of America Customized Cash Rewards"), true);
  assert.equal(names.has("Customized Cash Rewards"), false);

  assert.equal(names.has("Bank of America Premium Rewards"), true);
  assert.equal(names.has("Premium Rewards"), false);
});

test("buildCatalogCards applies reward overrides for selected reference cards", () => {
  const cards = buildCatalogCards();
  const byName = new Map(cards.map((card) => [card.name, card]));

  const amazonVisa = byName.get("Amazon Visa");
  assert.ok(amazonVisa);
  assert.deepEqual(amazonVisa.rewards, [
    { category: "dining", multiplier: 2 },
    { category: "gas", multiplier: 2 },
    { category: "online", multiplier: 3 },
    { category: "other", multiplier: 1 },
    { category: "transit", multiplier: 2 },
  ]);

  const ventureRewards = byName.get("Venture Rewards");
  assert.ok(ventureRewards);
  assert.deepEqual(ventureRewards.rewards, [
    { category: "other", multiplier: 2 },
    { category: "travel", multiplier: 2 },
    { category: "travel_portal", multiplier: 5 },
  ]);

  const ventureX = byName.get("Capital One Venture X");
  assert.ok(ventureX);
  assert.deepEqual(ventureX.rewards, [
    { category: "other", multiplier: 2 },
    { category: "travel", multiplier: 2 },
    { category: "travel_portal_car_rentals", multiplier: 10 },
    { category: "travel_portal_flights", multiplier: 5 },
    { category: "travel_portal_hotels", multiplier: 10 },
    { category: "travel_portal_vacation_rentals", multiplier: 5 },
  ]);

  const savor = byName.get("Capital One Savor");
  assert.ok(savor);
  assert.deepEqual(savor.rewards, [
    { category: "dining", multiplier: 3 },
    { category: "entertainment", multiplier: 3 },
    { category: "groceries", multiplier: 3 },
    { category: "other", multiplier: 1 },
    { category: "streaming", multiplier: 3 },
    { category: "travel_portal_car_rentals", multiplier: 5 },
    { category: "travel_portal_hotels", multiplier: 5 },
    { category: "travel_portal_vacation_rentals", multiplier: 5 },
  ]);

  const strataPremier = byName.get("Citi Strata Premier");
  assert.ok(strataPremier);
  assert.deepEqual(strataPremier.rewards, [
    { category: "dining", multiplier: 3 },
    { category: "gas", multiplier: 3 },
    { category: "groceries", multiplier: 3 },
    { category: "other", multiplier: 1 },
    { category: "travel", multiplier: 3 },
    { category: "travel_portal", multiplier: 10 },
  ]);

  const freedomUnlimited = byName.get("Chase Freedom Unlimited");
  assert.ok(freedomUnlimited);
  assert.deepEqual(freedomUnlimited.rewards, [
    { category: "dining", multiplier: 3 },
    { category: "drugstore", multiplier: 3 },
    { category: "other", multiplier: 1.5 },
    { category: "travel_portal", multiplier: 5 },
  ]);

  const unitedClub = byName.get("United Club Card");
  assert.ok(unitedClub);
  assert.deepEqual(unitedClub.rewards, [
    { category: "dining", multiplier: 2 },
    { category: "other", multiplier: 1 },
    { category: "travel", multiplier: 4 },
  ]);

  const deltaPlatinum = byName.get("Delta SkyMiles Platinum");
  assert.ok(deltaPlatinum);
  assert.deepEqual(deltaPlatinum.rewards, [
    { category: "dining", multiplier: 3 },
    { category: "groceries", multiplier: 3 },
    { category: "other", multiplier: 1 },
    { category: "travel", multiplier: 3 },
  ]);

  const hiltonSurpass = byName.get("Hilton Honors Surpass");
  assert.ok(hiltonSurpass);
  assert.deepEqual(hiltonSurpass.rewards, [
    { category: "dining", multiplier: 6 },
    { category: "gas", multiplier: 6 },
    { category: "groceries", multiplier: 6 },
    { category: "online", multiplier: 4 },
    { category: "other", multiplier: 3 },
    { category: "travel", multiplier: 12 },
  ]);

  const jetBluePlus = byName.get("JetBlue Plus Card");
  assert.ok(jetBluePlus);
  assert.deepEqual(jetBluePlus.rewards, [
    { category: "dining", multiplier: 2 },
    { category: "groceries", multiplier: 2 },
    { category: "other", multiplier: 1 },
    { category: "travel", multiplier: 6 },
  ]);

  const bankAmericard = byName.get("BankAmericard");
  assert.ok(bankAmericard);
  assert.deepEqual(bankAmericard.rewards, [{ category: "other", multiplier: 1 }]);

  const platinum = byName.get("Platinum Mastercard");
  assert.ok(platinum);
  assert.deepEqual(platinum.rewards, [{ category: "other", multiplier: 1 }]);

  const platinumSecured = byName.get("Platinum Secured");
  assert.ok(platinumSecured);
  assert.deepEqual(platinumSecured.rewards, [{ category: "other", multiplier: 1 }]);

  const usBankPlatinum = byName.get("U.S. Bank Visa Platinum");
  assert.ok(usBankPlatinum);
  assert.deepEqual(usBankPlatinum.rewards, [{ category: "other", multiplier: 1 }]);

  const fidelityRewardsVisa = byName.get("Fidelity Rewards Visa Signature Card");
  assert.ok(fidelityRewardsVisa);
  assert.deepEqual(fidelityRewardsVisa.rewards, [{ category: "other", multiplier: 2 }]);

  const reflect = byName.get("Wells Fargo Reflect");
  assert.ok(reflect);
  assert.deepEqual(reflect.rewards, [{ category: "other", multiplier: 1 }]);
});
