(function (root, factory) {
  const api = factory();

  if (typeof module === "object" && module.exports) {
    module.exports = api;
  }

  if (root) {
    root.CardTrackerComparisonCore = api;
  }
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
  function toFinitePositiveNumber(value) {
    const num = Number(value);
    if (!Number.isFinite(num) || num <= 0) return null;
    return num;
  }

  function formatMultiplier(multiplier) {
    const numeric = toFinitePositiveNumber(multiplier);
    if (!numeric) return "0x";
    return `${numeric.toString()}x`;
  }

  function getScoreForCategory(card, category) {
    const rewards = Array.isArray(card?.rewards) ? card.rewards : [];

    const direct = rewards.find((reward) => reward.category === category);
    if (direct) {
      const multiplier = toFinitePositiveNumber(direct.multiplier);
      if (multiplier) {
        return { qualifies: true, multiplier, source: "category match" };
      }
    }

    const fallback = rewards.find((reward) => reward.category === "other");
    if (fallback) {
      const multiplier = toFinitePositiveNumber(fallback.multiplier);
      if (multiplier) {
        return { qualifies: true, multiplier, source: "other fallback" };
      }
    }

    return { qualifies: false, multiplier: null, source: "no match" };
  }

  function compareByScoreThenName(left, right) {
    if (left.multiplier !== right.multiplier) {
      return right.multiplier - left.multiplier;
    }

    const leftName = (left.card?.name || "").toLowerCase();
    const rightName = (right.card?.name || "").toLowerCase();
    return leftName.localeCompare(rightName);
  }

  function computeComparisonResults(cards, category) {
    return (Array.isArray(cards) ? cards : [])
      .map((card) => {
        const score = getScoreForCategory(card, category);
        return {
          card,
          multiplier: score.multiplier,
          source: score.source,
          qualifies: score.qualifies,
        };
      })
      .filter((entry) => entry.qualifies)
      .sort(compareByScoreThenName);
  }

  return {
    formatMultiplier,
    getScoreForCategory,
    computeComparisonResults,
  };
});
