import test from "node:test";
import assert from "node:assert/strict";

import walletCore from "../wallet-core.js";

const {
  addWalletCard,
  createCatalogWalletCard,
  getCatalogMembership,
  getCatalogCardId,
  getWalletOriginType,
  hasCatalogDuplicate,
  isCatalogWalletCard,
  isCustomWalletCard,
  normalizeRewardEntries,
  normalizeWalletCard,
  normalizeWalletCards,
  removeCatalogWalletCard,
  toCatalogWalletId,
} = walletCore;

test("createCatalogWalletCard converts catalog card into persisted wallet shape", () => {
  const now = "2026-02-28T15:00:00.000Z";
  const walletCard = createCatalogWalletCard(
    {
      id: "chase-sapphire-preferred",
      name: "Chase Sapphire Preferred",
      issuer: "Chase",
      rewards: {
        travel: 2,
        dining: 3,
        other: 1,
      },
    },
    now,
  );

  assert.equal(walletCard.id, "catalog-chase-sapphire-preferred");
  assert.equal(walletCard.name, "Chase Sapphire Preferred");
  assert.equal(walletCard.issuer, "Chase");
  assert.equal(walletCard.createdAt, now);
  assert.equal(walletCard.updatedAt, now);
  assert.equal(walletCard.originType, "catalog");
  assert.deepEqual(walletCard.origin, {
    type: "catalog",
    catalogCardId: "chase-sapphire-preferred",
  });
  assert.deepEqual(walletCard.rewards, [
    { category: "dining", multiplier: 3 },
    { category: "other", multiplier: 1 },
    { category: "travel", multiplier: 2 },
  ]);
});

test("createCatalogWalletCard produces deterministic ids for the same catalog card", () => {
  const card = {
    id: "capital-one-venture-x",
    name: "Capital One Venture X",
    issuer: "Capital One",
    rewards: [{ category: "travel", multiplier: 2 }],
  };

  const first = createCatalogWalletCard(card, "2026-02-28T15:00:00.000Z");
  const second = createCatalogWalletCard(card, "2026-02-28T15:01:00.000Z");

  assert.equal(first.id, second.id);
  assert.equal(first.catalogCardId, second.catalogCardId);
  assert.equal(first.id, toCatalogWalletId(card.id));
});

test("normalizeWalletCard keeps catalog origin metadata for persisted reload", () => {
  const normalized = normalizeWalletCard({
    id: "catalog-chase-freedom-unlimited",
    name: "Chase Freedom Unlimited",
    issuer: "Chase",
    rewards: [
      { category: "dining", multiplier: 3 },
      { category: "other", multiplier: 1.5 },
    ],
    createdAt: "2026-02-28T15:10:00.000Z",
    updatedAt: "2026-02-28T15:12:00.000Z",
    origin: {
      type: "catalog",
      catalogCardId: "chase-freedom-unlimited",
    },
  });

  assert.equal(normalized?.originType, "catalog");
  assert.equal(normalized?.catalogCardId, "chase-freedom-unlimited");
  assert.equal(normalized?.origin?.catalogCardId, "chase-freedom-unlimited");
  assert.deepEqual(normalized?.rewards, [
    { category: "dining", multiplier: 3 },
    { category: "other", multiplier: 1.5 },
  ]);
});

test("normalizeWalletCards filters malformed entries and normalizes safe objects", () => {
  const normalized = normalizeWalletCards([
    null,
    { id: "bad-card", rewards: [] },
    {
      id: "custom-1",
      name: "Custom Card",
      issuer: "Test Bank",
      rewards: [
        { category: "travel", multiplier: "2" },
        { category: "travel", multiplier: 3 },
      ],
      createdAt: "invalid",
      updatedAt: "2026-02-28T15:14:00.000Z",
    },
  ]);

  assert.equal(normalized.length, 1);
  assert.equal(normalized[0].originType, "custom");
  assert.deepEqual(normalized[0].rewards, [{ category: "travel", multiplier: 3 }]);
});

test("normalizeWalletCard migrates legacy cards without origin metadata to explicit custom origin", () => {
  const normalized = normalizeWalletCard({
    id: "legacy-custom-card",
    name: "Legacy Custom",
    issuer: "Legacy Bank",
    rewards: [{ category: "other", multiplier: 1.5 }],
    createdAt: "2026-02-01T00:00:00.000Z",
    updatedAt: "2026-02-02T00:00:00.000Z",
  });

  assert.equal(normalized?.originType, "custom");
  assert.equal(normalized?.origin?.type, "custom");
  assert.equal(normalized?.catalogCardId, undefined);
  assert.equal(isCustomWalletCard(normalized), true);
  assert.equal(isCatalogWalletCard(normalized), false);
});

test("wallet origin helpers resolve deterministic catalog/custom semantics", () => {
  const catalogCard = {
    id: "catalog-amex-gold",
    name: "American Express Gold",
    rewards: [{ category: "dining", multiplier: 4 }],
    catalogCardId: "amex-gold",
  };
  const customCard = {
    id: "custom-local",
    name: "Local CU Card",
    rewards: [{ category: "gas", multiplier: 2 }],
  };

  assert.equal(getWalletOriginType(catalogCard), "catalog");
  assert.equal(isCatalogWalletCard(catalogCard), true);
  assert.equal(isCustomWalletCard(catalogCard), false);

  assert.equal(getWalletOriginType(customCard), "custom");
  assert.equal(isCatalogWalletCard(customCard), false);
  assert.equal(isCustomWalletCard(customCard), true);
});

test("hasCatalogDuplicate matches by catalog identity even with persisted shape variants", () => {
  const walletCards = normalizeWalletCards([
    {
      id: "catalog-chase-freedom-unlimited",
      name: "Chase Freedom Unlimited",
      issuer: "Chase",
      rewards: [{ category: "travel", multiplier: 5 }],
      originType: "catalog",
      origin: {
        type: "catalog",
        catalogCardId: "chase-freedom-unlimited",
      },
    },
  ]);

  assert.equal(hasCatalogDuplicate(walletCards, "chase-freedom-unlimited"), true);
  assert.equal(hasCatalogDuplicate(walletCards, "chase-sapphire-preferred"), false);
  assert.equal(getCatalogCardId(walletCards[0]), "chase-freedom-unlimited");
});

test("addWalletCard blocks duplicate catalog cards for stale repeated interactions", () => {
  const first = createCatalogWalletCard(
    {
      id: "citi-double-cash",
      name: "Citi Double Cash",
      issuer: "Citi",
      rewards: [{ category: "other", multiplier: 2 }],
    },
    "2026-02-28T15:20:00.000Z",
  );
  const duplicate = createCatalogWalletCard(
    {
      id: "citi-double-cash",
      name: "Citi Double Cash",
      issuer: "Citi",
      rewards: [{ category: "other", multiplier: 2 }],
    },
    "2026-02-28T15:21:00.000Z",
  );

  const once = addWalletCard([], first);
  const twice = addWalletCard(once, duplicate);

  assert.equal(once.length, 1);
  assert.equal(twice.length, 1);
  assert.equal(twice[0].catalogCardId, "citi-double-cash");
});

test("removeCatalogWalletCard removes catalog entries and updates membership", () => {
  const walletCards = normalizeWalletCards([
    createCatalogWalletCard(
      {
        id: "amex-gold",
        name: "American Express Gold Card",
        issuer: "American Express",
        rewards: [{ category: "dining", multiplier: 4 }],
      },
      "2026-02-28T15:30:00.000Z",
    ),
    {
      id: "custom-one",
      name: "Custom One",
      issuer: "Local Bank",
      rewards: [{ category: "travel", multiplier: 2 }],
    },
  ]);

  const removed = removeCatalogWalletCard(walletCards, "catalog-amex-gold");
  const membership = getCatalogMembership(removed);

  assert.equal(removed.length, 1);
  assert.equal(removed[0].originType, "custom");
  assert.equal(membership.has("amex-gold"), false);
  assert.equal(hasCatalogDuplicate(removed, "amex-gold"), false);
});

test("catalog card becomes re-addable after removal", () => {
  const catalogCard = createCatalogWalletCard(
    {
      id: "wells-fargo-autograph",
      name: "Wells Fargo Autograph",
      issuer: "Wells Fargo",
      rewards: [{ category: "travel", multiplier: 3 }],
    },
    "2026-02-28T15:31:00.000Z",
  );

  const once = addWalletCard([], catalogCard);
  const removed = removeCatalogWalletCard(once, catalogCard.id);
  const readded = addWalletCard(removed, catalogCard);

  assert.equal(once.length, 1);
  assert.equal(removed.length, 0);
  assert.equal(readded.length, 1);
  assert.equal(readded[0].catalogCardId, "wells-fargo-autograph");
});

test("normalizeRewardEntries deduplicates categories and drops invalid values", () => {
  const rewards = normalizeRewardEntries([
    { category: "travel", multiplier: 2 },
    { category: "travel", multiplier: 3 },
    { category: "other", multiplier: "1" },
    { category: "other", multiplier: 0 },
    { category: "", multiplier: 10 },
    { category: "gas", multiplier: "oops" },
  ]);

  assert.deepEqual(rewards, [
    { category: "other", multiplier: 1 },
    { category: "travel", multiplier: 3 },
  ]);
});
