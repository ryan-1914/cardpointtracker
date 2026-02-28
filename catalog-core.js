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
      network: "Visa",
      rewards: {
        travel: 2,
        travel_portal: 5,
        dining: 3,
        streaming: 3,
        online: 3,
        other: 1,
      },
    },
    {
      name: "Chase Sapphire Reserve",
      issuer: "Chase",
      network: "Visa",
      rewards: {
        travel: 3,
        travel_portal: 10,
        dining: 3,
        other: 1,
      },
    },
    {
      name: "Chase Freedom Unlimited",
      issuer: "Chase",
      network: "Visa",
      rewards: {
        dining: 3,
        drugstore: 3,
        travel_portal: 5,
        other: 1.5,
      },
    },
    {
      name: "American Express Gold Card",
      issuer: "American Express",
      network: "American Express",
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
        travel_portal: 10,
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
        streaming: 3,
        online: 3,
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
      name: "Citi Custom Cash",
      issuer: "Citi",
      network: "Mastercard",
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
      network: "Visa",
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
      network: "Discover",
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
      network: "Visa / Mastercard",
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
      network: "Visa",
      rewards: {
        dining: 4,
        groceries: 2,
        gas: 2,
        streaming: 2,
        other: 1,
      },
    },
    {
      name: "Chase Freedom Flex",
      issuer: "Chase",
      network: "Mastercard",
      rewards: {
        dining: 3,
        drugstore: 3,
        travel_portal: 5,
        other: 1,
      },
    },
    {
      name: "Ink Business Preferred",
      issuer: "Chase",
      network: "Visa",
      rewards: {
        travel: 3,
        online: 3,
        streaming: 3,
        transit: 3,
        other: 1,
      },
    },
    {
      name: "The Platinum Card",
      issuer: "American Express",
      network: "American Express",
      rewards: {
        travel: 5,
        other: 1,
      },
    },
    {
      name: "Blue Cash Everyday",
      issuer: "American Express",
      network: "American Express",
      rewards: {
        groceries: 3,
        gas: 3,
        online: 3,
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
      name: "Wells Fargo Active Cash",
      issuer: "Wells Fargo",
      network: "Visa",
      rewards: {
        other: 2,
      },
    },
    {
      name: "Wells Fargo Autograph Journey",
      issuer: "Wells Fargo",
      network: "Visa",
      rewards: {
        travel: 5,
        dining: 3,
        other: 1,
      },
    },
    {
      name: "Discover it Miles",
      issuer: "Discover",
      network: "Discover",
      rewards: {
        other: 1.5,
      },
    },
    {
      name: "Bank of America Premium Rewards",
      issuer: "Bank of America",
      network: "Visa",
      rewards: {
        travel: 2,
        dining: 2,
        other: 1.5,
      },
    },
    {
      name: "U.S. Bank Cash+",
      issuer: "U.S. Bank",
      network: "Visa",
      rewards: {
        online: 5,
        streaming: 5,
        other: 1,
      },
    },
    {
      name: "Amazon Prime Visa",
      issuer: "Chase",
      network: "Visa",
      rewards: {
        online: 5,
        dining: 2,
        gas: 2,
        other: 1,
      },
    },
  ];

  const CATALOG_REFERENCE_SEED = [
    // =========================
    // Chase
    // =========================
    { name: "Chase Sapphire Preferred", issuer: "Chase", network: "Visa", link: "https://creditcards.chase.com/rewards-credit-cards/sapphire/preferred" },
    { name: "Chase Sapphire Reserve", issuer: "Chase", network: "Visa", link: "https://creditcards.chase.com/rewards-credit-cards/sapphire/reserve" },
    { name: "Chase Freedom Unlimited", issuer: "Chase", network: "Visa", link: "https://www.chase.com/personal/credit-cards/freedom/unlimited" },
    { name: "Chase Freedom Flex", issuer: "Chase", network: "Mastercard", link: "https://creditcards.chase.com/cash-back-credit-cards/freedom/flex" },
    { name: "United Explorer Card", issuer: "Chase", network: "Visa", link: "https://creditcards.chase.com/travel-credit-cards/united/united-explorer" },
    { name: "United Quest Card", issuer: "Chase", network: "Visa", link: "https://creditcards.chase.com/travel-credit-cards/united/united-quest" },
    { name: "United Club Card", issuer: "Chase", network: "Visa", link: "https://creditcards.chase.com/travel-credit-cards/united/united-club" },
    { name: "United Gateway Card", issuer: "Chase", network: "Visa", link: "https://creditcards.chase.com/travel-credit-cards/united/united-gateway" },
    { name: "Southwest Rapid Rewards Plus", issuer: "Chase", network: "Visa", link: "https://creditcards.chase.com/travel-credit-cards/southwest/plus" },
    { name: "Southwest Rapid Rewards Premier", issuer: "Chase", network: "Visa", link: "https://creditcards.chase.com/travel-credit-cards/southwest/premier" },
    { name: "Southwest Rapid Rewards Priority", issuer: "Chase", network: "Visa", link: "https://creditcards.chase.com/travel-credit-cards/southwest/priority" },
    { name: "Marriott Bonvoy Bold", issuer: "Chase", network: "Visa", link: "https://creditcards.chase.com/travel-credit-cards/marriott-bonvoy/bold" },
    { name: "Marriott Bonvoy Boundless", issuer: "Chase", network: "Visa", link: "https://creditcards.chase.com/travel-credit-cards/marriott-bonvoy/boundless" },
    { name: "Marriott Bonvoy Bountiful", issuer: "Chase", network: "Visa", link: "https://creditcards.chase.com/travel-credit-cards/marriott-bonvoy/bountiful" },
    { name: "IHG One Rewards Traveler", issuer: "Chase", network: "Mastercard", link: "https://creditcards.chase.com/travel-credit-cards/ihg/traveler" },
    { name: "IHG One Rewards Premier", issuer: "Chase", network: "Mastercard", link: "https://creditcards.chase.com/travel-credit-cards/ihg/premier" },
    { name: "World of Hyatt", issuer: "Chase", network: "Visa", link: "https://creditcards.chase.com/travel-credit-cards/hyatt/world-of-hyatt" },
    { name: "Prime Visa", issuer: "Chase", network: "Visa", link: "https://creditcards.chase.com/cash-back-credit-cards/amazon/prime-rewards" },
    { name: "Amazon Visa", issuer: "Chase", network: "Visa", link: "https://creditcards.chase.com/cash-back-credit-cards/amazon/amazon-rewards" },
    // =========================
    // American Express
    // =========================
    { name: "The Platinum Card", issuer: "American Express", network: "Amex", link: "https://www.americanexpress.com/us/credit-cards/card/platinum/" },
    { name: "American Express Gold Card", issuer: "American Express", network: "Amex", link: "https://www.americanexpress.com/us/credit-cards/card/gold-card/" },
    { name: "American Express Green Card", issuer: "American Express", network: "Amex", link: "https://www.americanexpress.com/us/credit-cards/card/green/" },
    { name: "Blue Cash Preferred", issuer: "American Express", network: "Amex", link: "https://www.americanexpress.com/us/credit-cards/card/blue-cash-preferred/" },
    { name: "Blue Cash Everyday", issuer: "American Express", network: "Amex", link: "https://www.americanexpress.com/us/credit-cards/card/blue-cash-everyday/" },
    { name: "Cash Magnet", issuer: "American Express", network: "Amex", link: "https://www.americanexpress.com/us/credit-cards/card/cash-magnet/" },
    { name: "Hilton Honors", issuer: "American Express", network: "Amex", link: "https://www.americanexpress.com/us/credit-cards/card/hilton-honors/" },
    { name: "Hilton Honors Surpass", issuer: "American Express", network: "Amex", link: "https://www.americanexpress.com/us/credit-cards/card/hilton-honors-surpass/" },
    { name: "Hilton Honors Aspire", issuer: "American Express", network: "Amex", link: "https://www.americanexpress.com/us/credit-cards/card/hilton-honors-aspire/" },
    { name: "Delta SkyMiles Blue", issuer: "American Express", network: "Amex", link: "https://www.americanexpress.com/us/credit-cards/card/delta-skymiles-blue-american-express-card/" },
    { name: "Delta SkyMiles Gold", issuer: "American Express", network: "Amex", link: "https://www.americanexpress.com/us/credit-cards/card/delta-skymiles-gold-american-express-card/" },
    { name: "Delta SkyMiles Platinum", issuer: "American Express", network: "Amex", link: "https://www.americanexpress.com/us/credit-cards/card/delta-skymiles-platinum-american-express-card/" },
    { name: "Delta SkyMiles Reserve", issuer: "American Express", network: "Amex", link: "https://www.americanexpress.com/us/credit-cards/card/delta-skymiles-reserve-american-express-card/" },
    { name: "Marriott Bonvoy Bevy", issuer: "American Express", network: "Amex", link: "https://www.americanexpress.com/us/credit-cards/card/marriott-bonvoy-bevy/" },
    { name: "Marriott Bonvoy Brilliant", issuer: "American Express", network: "Amex", link: "https://www.americanexpress.com/us/credit-cards/card/marriott-bonvoy-brilliant/" },
    { name: "Marriott Bonvoy (no-fee)", issuer: "American Express", network: "Amex", link: "https://www.americanexpress.com/us/credit-cards/card/marriott-bonvoy/" },

    // =========================
    // Citi
    // =========================
    { name: "Citi Strata Premier", issuer: "Citi", network: "Mastercard", link: "https://www.citi.com/credit-cards/citi-strata-premier-credit-card" },
    { name: "Citi Strata", issuer: "Citi", network: "Mastercard", link: "https://www.citi.com/credit-cards/citi-strata-credit-card" },
    { name: "Citi Strata Elite", issuer: "Citi", network: "Mastercard", link: "https://www.citi.com/credit-cards/citi-strata-elite-credit-card" },
    { name: "Citi Double Cash", issuer: "Citi", network: "Mastercard", link: "https://www.citi.com/credit-cards/citi-double-cash-credit-card" },
    { name: "Citi Custom Cash", issuer: "Citi", network: "Mastercard", link: "https://www.citi.com/credit-cards/citi-custom-cash-credit-card" },
    { name: "Citi Rewards+", issuer: "Citi", network: "Mastercard", link: "https://www.citi.com/credit-cards/citi-rewards-plus-credit-card" },
    { name: "Citi / AAdvantage Platinum Select", issuer: "Citi", network: "Mastercard", link: "https://www.citi.com/credit-cards/citi-aadvantage-platinum-select-credit-card" },
    { name: "Citi / AAdvantage MileUp", issuer: "Citi", network: "Mastercard", link: "https://www.citi.com/credit-cards/citi-aadvantage-mileup-credit-card" },
    { name: "Citi / AAdvantage Executive", issuer: "Citi", network: "Mastercard", link: "https://www.citi.com/credit-cards/citi-aadvantage-executive-credit-card" },

    // =========================
    // Capital One
    // =========================
    { name: "Venture X Rewards", issuer: "Capital One", network: "Visa", link: "https://www.capitalone.com/credit-cards/venture-x/" },
    { name: "Venture Rewards", issuer: "Capital One", network: "Visa", link: "https://www.capitalone.com/credit-cards/venture/" },
    { name: "VentureOne Rewards", issuer: "Capital One", network: "Visa", link: "https://www.capitalone.com/credit-cards/ventureone/" },
    { name: "Savor Rewards", issuer: "Capital One", network: "Mastercard", link: "https://www.capitalone.com/credit-cards/savor/" },
    { name: "SavorOne Rewards", issuer: "Capital One", network: "Mastercard", link: "https://www.capitalone.com/credit-cards/savorone/" },
    { name: "Quicksilver Rewards", issuer: "Capital One", network: "Visa", link: "https://www.capitalone.com/credit-cards/quicksilver/" },
    { name: "QuicksilverOne Rewards", issuer: "Capital One", network: "Mastercard", link: "https://www.capitalone.com/credit-cards/quicksilverone/" },
    { name: "Quicksilver Secured", issuer: "Capital One", network: "Mastercard", link: "https://www.capitalone.com/credit-cards/quicksilver-secured/" },
    { name: "Platinum Mastercard", issuer: "Capital One", network: "Mastercard", link: "https://www.capitalone.com/credit-cards/platinum/" },
    { name: "Platinum Secured", issuer: "Capital One", network: "Mastercard", link: "https://www.capitalone.com/credit-cards/platinum-secured/" },
    { name: "Quicksilver Rewards for Students", issuer: "Capital One", network: "Mastercard", link: "https://www.capitalone.com/credit-cards/quicksilver-student/" },
    { name: "Savor Rewards for Students", issuer: "Capital One", network: "Mastercard", link: "https://www.capitalone.com/credit-cards/savor-student/" },

    // =========================
    // Bank of America
    // =========================
    { name: "Customized Cash Rewards", issuer: "Bank of America", network: "Visa", link: "https://www.bankofamerica.com/credit-cards/products/customized-cash-rewards-credit-card/" },
    { name: "Unlimited Cash Rewards", issuer: "Bank of America", network: "Visa", link: "https://www.bankofamerica.com/credit-cards/products/unlimited-cash-back-credit-card/" },
    { name: "Travel Rewards", issuer: "Bank of America", network: "Visa", link: "https://www.bankofamerica.com/credit-cards/products/travel-rewards-credit-card/" },
    { name: "Premium Rewards", issuer: "Bank of America", network: "Visa", link: "https://www.bankofamerica.com/credit-cards/products/premium-rewards-credit-card/" },
    { name: "Premium Rewards Elite", issuer: "Bank of America", network: "Visa", link: "https://www.bankofamerica.com/credit-cards/products/premium-rewards-elite-credit-card/" },
    { name: "BankAmericard", issuer: "Bank of America", network: "Visa", link: "https://www.bankofamerica.com/credit-cards/products/bankamericard-credit-card/" },

    // =========================
    // Discover
    // =========================
    { name: "Discover it Cash Back", issuer: "Discover", network: "Discover", link: "https://www.discover.com/credit-cards/cash-back/cashback-bonus.html" },
    { name: "Discover it Chrome", issuer: "Discover", network: "Discover", link: "https://www.discover.com/credit-cards/cash-back/chrome.html" },
    { name: "Discover it Miles", issuer: "Discover", network: "Discover", link: "https://www.discover.com/credit-cards/travel/" },
    { name: "Discover it Student Cash Back", issuer: "Discover", network: "Discover", link: "https://www.discover.com/credit-cards/student/" },

    // =========================
    // Wells Fargo
    // =========================
    { name: "Wells Fargo Active Cash", issuer: "Wells Fargo", network: "Visa", link: "https://creditcards.wellsfargo.com/active-cash-credit-card/" },
    { name: "Wells Fargo Autograph", issuer: "Wells Fargo", network: "Visa", link: "https://creditcards.wellsfargo.com/autograph-visa-credit-card/" },
    { name: "Wells Fargo Autograph Journey", issuer: "Wells Fargo", network: "Visa", link: "https://creditcards.wellsfargo.com/autograph-journey-visa-credit-card/" },
    { name: "Wells Fargo Reflect", issuer: "Wells Fargo", network: "Visa", link: "https://creditcards.wellsfargo.com/reflect-visa-credit-card/" },

    // =========================
    // U.S. Bank
    // =========================
    { name: "U.S. Bank Altitude Reserve", issuer: "U.S. Bank", network: "Visa", link: "https://www.usbank.com/credit-cards/altitude-reserve-visa-infinite-credit-card.html" },
    { name: "U.S. Bank Altitude Go", issuer: "U.S. Bank", network: "Visa", link: "https://www.usbank.com/credit-cards/altitude-go-visa-signature-credit-card.html" },
    { name: "U.S. Bank Cash+", issuer: "U.S. Bank", network: "Visa", link: "https://www.usbank.com/credit-cards/cash-plus-visa-signature-credit-card.html" },
    { name: "U.S. Bank Shopper Cash Rewards", issuer: "U.S. Bank", network: "Visa", link: "https://www.usbank.com/credit-cards/shopper-cash-rewards-visa-signature-credit-card.html" },
    { name: "U.S. Bank Visa Platinum", issuer: "U.S. Bank", network: "Visa", link: "https://www.usbank.com/credit-cards/visa-platinum-credit-card.html" },

    // =========================
    // Barclays
    // =========================
    { name: "JetBlue Plus Card", issuer: "Barclays", network: "Mastercard", link: "https://cards.barclaycardus.com/banking/cards/jetblue-plus-card/" },
    { name: "JetBlue Card", issuer: "Barclays", network: "Mastercard", link: "https://cards.barclaycardus.com/banking/cards/jetblue-card/" },
    { name: "Hawaiian Airlines World Elite Mastercard", issuer: "Barclays", network: "Mastercard", link: "https://cards.barclaycardus.com/banking/cards/hawaiian-airlines-world-elite-mastercard/" },
    { name: "Wyndham Earner", issuer: "Barclays", network: "Mastercard", link: "https://cards.barclaycardus.com/banking/cards/wyndham-earner-card/" },
    { name: "Wyndham Earner Plus", issuer: "Barclays", network: "Mastercard", link: "https://cards.barclaycardus.com/banking/cards/wyndham-earner-plus-card/" },
    { name: "Wyndham Earner Business", issuer: "Barclays", network: "Mastercard", link: "https://cards.barclaycardus.com/banking/cards/wyndham-earner-business-card/" },

    // =========================
    // Synchrony
    // =========================
    { name: "PayPal Cashback Mastercard", issuer: "Synchrony", network: "Mastercard", link: "https://www.synchrony.com/financing/paypal/" },
    { name: "Venmo Credit Card", issuer: "Synchrony", network: "Visa", link: "https://venmo.com/about/creditcard/" },
  ];

  const CATALOG_PRODUCT_ALIASES = {
    "capital one|venture x rewards": "capital one venture x",
    "capital one|savor rewards": "capital one savor",
    "capital one|quicksilver rewards": "capital one quicksilver",
    "chase|prime visa": "amazon prime visa",
    "bank of america|customized cash rewards": "bank of america customized cash rewards",
    "bank of america|premium rewards": "bank of america premium rewards",
  };

  // Incremental reward population for reference cards that do not have inline rewards yet.
  const CATALOG_REFERENCE_REWARD_OVERRIDES = {
    "american express|american express green card": {
      travel: 3,
      transit: 3,
      dining: 3,
      other: 1,
    },
    "american express|cash magnet": {
      other: 1.5,
    },
    "bank of america|travel rewards": {
      travel: 1.5,
      other: 1.5,
    },
    "bank of america|bankamericard": {
      other: 1,
    },
    "bank of america|unlimited cash rewards": {
      other: 1.5,
    },
    "bank of america|premium rewards elite": {
      travel: 2,
      dining: 2,
      other: 1.5,
    },
    "capital one|venture rewards": {
      travel: 2,
      travel_portal: 5,
      other: 2,
    },
    "capital one|ventureone rewards": {
      travel: 1.25,
      travel_portal: 5,
      other: 1.25,
    },
    "capital one|savorone rewards": {
      dining: 3,
      groceries: 3,
      streaming: 3,
      online: 3,
      travel_portal: 5,
      other: 1,
    },
    "capital one|quicksilverone rewards": {
      other: 1.5,
    },
    "capital one|platinum mastercard": {
      other: 1,
    },
    "capital one|platinum secured": {
      other: 1,
    },
    "capital one|quicksilver secured": {
      other: 1.5,
    },
    "capital one|quicksilver rewards for students": {
      other: 1.5,
    },
    "capital one|savor rewards for students": {
      dining: 3,
      groceries: 3,
      streaming: 3,
      online: 3,
      other: 1,
    },
    "chase|amazon visa": {
      online: 3,
      dining: 2,
      gas: 2,
      transit: 2,
      other: 1,
    },
    "chase|ihg one rewards traveler": {
      travel: 5,
      dining: 3,
      gas: 3,
      groceries: 3,
      other: 1,
    },
    "chase|ihg one rewards premier": {
      travel: 5,
      dining: 3,
      gas: 3,
      other: 1,
    },
    "chase|marriott bonvoy bold": {
      travel: 3,
      other: 2,
    },
    "chase|marriott bonvoy boundless": {
      travel: 6,
      other: 2,
    },
    "chase|marriott bonvoy bountiful": {
      travel: 6,
      dining: 4,
      groceries: 4,
      other: 2,
    },
    "chase|southwest rapid rewards plus": {
      travel: 2,
      other: 1,
    },
    "chase|southwest rapid rewards premier": {
      travel: 2,
      other: 1,
    },
    "chase|southwest rapid rewards priority": {
      travel: 2,
      other: 1,
    },
    "chase|united explorer card": {
      travel: 2,
      dining: 2,
      other: 1,
    },
    "chase|united quest card": {
      travel: 3,
      dining: 2,
      other: 1,
    },
    "chase|united club card": {
      travel: 4,
      dining: 2,
      other: 1,
    },
    "chase|united gateway card": {
      travel: 2,
      other: 1,
    },
    "chase|world of hyatt": {
      travel: 4,
      dining: 2,
      transit: 2,
      online: 2,
      other: 1,
    },
    "citi|citi rewards+": {
      groceries: 2,
      gas: 2,
      other: 1,
    },
    "citi|citi strata premier": {
      travel: 3,
      travel_portal: 10,
      dining: 3,
      groceries: 3,
      gas: 3,
      other: 1,
    },
    "citi|citi strata": {
      travel: 3,
      travel_portal: 10,
      dining: 3,
      groceries: 3,
      gas: 3,
      other: 1,
    },
    "citi|citi strata elite": {
      travel: 6,
      dining: 6,
      other: 1,
    },
    "citi|citi / aadvantage mileup": {
      groceries: 2,
      other: 1,
    },
    "citi|citi / aadvantage platinum select": {
      travel: 2,
      gas: 2,
      dining: 2,
      other: 1,
    },
    "citi|citi / aadvantage executive": {
      travel: 4,
      other: 1,
    },
    "discover|discover it chrome": {
      gas: 2,
      dining: 2,
      other: 1,
    },
    "discover|discover it student cash back": {
      groceries: 5,
      gas: 5,
      online: 5,
      dining: 5,
      other: 1,
    },
    "synchrony|paypal cashback mastercard": {
      online: 3,
      other: 2,
    },
    "american express|delta skymiles blue": {
      dining: 2,
      other: 1,
    },
    "american express|delta skymiles gold": {
      dining: 2,
      groceries: 2,
      other: 1,
    },
    "american express|delta skymiles platinum": {
      travel: 3,
      dining: 3,
      groceries: 3,
      other: 1,
    },
    "american express|delta skymiles reserve": {
      travel: 3,
      other: 1,
    },
    "american express|marriott bonvoy (no-fee)": {
      travel: 6,
      other: 2,
    },
    "american express|marriott bonvoy bevy": {
      travel: 6,
      dining: 4,
      groceries: 4,
      other: 2,
    },
    "american express|marriott bonvoy brilliant": {
      travel: 6,
      dining: 3,
      other: 2,
    },
    "american express|hilton honors": {
      travel: 7,
      dining: 5,
      groceries: 5,
      gas: 5,
      other: 3,
    },
    "american express|hilton honors surpass": {
      travel: 12,
      dining: 6,
      groceries: 6,
      gas: 6,
      online: 4,
      other: 3,
    },
    "american express|hilton honors aspire": {
      travel: 14,
      travel_portal: 7,
      dining: 7,
      other: 3,
    },
    "barclays|hawaiian airlines world elite mastercard": {
      travel: 3,
      dining: 2,
      gas: 2,
      groceries: 2,
      other: 1,
    },
    "barclays|jetblue card": {
      travel: 3,
      dining: 2,
      groceries: 2,
      other: 1,
    },
    "barclays|jetblue plus card": {
      travel: 6,
      dining: 2,
      groceries: 2,
      other: 1,
    },
    "barclays|wyndham earner": {
      travel: 5,
      gas: 5,
      dining: 2,
      groceries: 2,
      other: 1,
    },
    "barclays|wyndham earner plus": {
      travel: 6,
      gas: 6,
      dining: 4,
      groceries: 4,
      other: 1,
    },
    "barclays|wyndham earner business": {
      travel: 8,
      gas: 8,
      utilities: 5,
      online: 5,
      other: 1,
    },
    "synchrony|venmo credit card": {
      dining: 3,
      groceries: 3,
      gas: 3,
      transit: 3,
      online: 3,
      travel: 3,
      entertainment: 3,
      utilities: 3,
      other: 1,
    },
    "u.s. bank|u.s. bank altitude reserve": {
      travel: 3,
      travel_portal: 5,
      other: 1,
    },
    "u.s. bank|u.s. bank shopper cash rewards": {
      online: 6,
      streaming: 3,
      other: 1,
    },
    "u.s. bank|u.s. bank visa platinum": {
      other: 1,
    },
    "wells fargo|wells fargo reflect": {
      other: 1,
    },
  };

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

  function sanitizeLink(value) {
    const text = String(value || "").trim();
    if (!text) return "";
    try {
      const url = new URL(text);
      const protocol = url.protocol.toLowerCase();
      if (protocol === "http:" || protocol === "https:") {
        return url.toString();
      }
      return "";
    } catch (_error) {
      return "";
    }
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
    const link = sanitizeLink(card?.link);
    const idSeed = card?.id || `${issuer}-${name || `card-${index + 1}`}`;
    const id = slugify(idSeed) || `catalog-card-${index + 1}`;
    const rewardsInput = card?.rewards || getReferenceRewardOverride(card);
    const rewards = normalizeRewardEntries(rewardsInput);

    return {
      id,
      name: name || `Card ${index + 1}`,
      issuer,
      network,
      link,
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

      if (!existing.link && normalized.link) {
        byProduct.set(productKey, { ...existing, link: normalized.link });
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
