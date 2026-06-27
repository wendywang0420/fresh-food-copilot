export type ChannelPlaybookId =
  | "cafe_chain"
  | "qsr_pizza"
  | "convenience_retail"
  | "grab_and_go_retail"
  | "airline_catering"
  | "supermarket_chilled_ready_meal"
  | "bakery_cafe"
  | "china_qsr_localized"
  | "general_foodservice";

export interface ChannelPlaybook {
  channel: ChannelPlaybookId;
  operationalRealities: string[];
  preferredFormats: string[];
  riskyFormats: string[];
  mustAddress: string[];
  commonFailureModes: string[];
}

export const CHANNEL_PLAYBOOKS: Record<ChannelPlaybookId, ChannelPlaybook> = {
  cafe_chain: {
    channel: "cafe_chain",
    operationalRealities: [
      "limited store equipment",
      "warming ovens common",
      "low staff skill tolerance",
      "fast service",
      "beverage pairing matters",
    ],
    preferredFormats: [
      "warmable sandwich",
      "filled pastry",
      "savory hand pie",
      "stuffed focaccia",
      "egg bite",
      "pre-assembled flatbread pocket",
    ],
    riskyFormats: [
      "dressed salad",
      "chilled bowl requiring assembly",
      "multi-component plated dish",
      "products requiring full cooking",
    ],
    mustAddress: [
      "warming time",
      "texture after reheating",
      "packaging",
      "hold time",
      "beverage pairing",
    ],
    commonFailureModes: [
      "suggesting salads for oven-only stores",
      "ignoring moisture migration",
      "assuming in-store prep",
    ],
  },
  qsr_pizza: {
    channel: "qsr_pizza",
    operationalRealities: [
      "conveyor ovens dominate execution",
      "high throughput and delivery mix",
      "shareability is important",
      "heat-hold matters across delivery windows",
      "sides must sit next to pizza without feeling redundant",
    ],
    preferredFormats: [
      "stuffed breadstick alternative",
      "baked dipper",
      "oven-finished bite",
      "shareable pull-apart item",
      "crisp baked side with separate dip",
    ],
    riskyFormats: [
      "garlic bread lookalikes",
      "fragile fried items",
      "loose sauced vegetables",
      "items needing stovetop finishing",
      "formats that steam out in closed delivery boxes",
    ],
    mustAddress: [
      "delivery texture",
      "heat retention",
      "oven compatibility",
      "shareable portioning",
      "packaging venting",
    ],
    commonFailureModes: [
      "recommending sides that duplicate garlic bread",
      "claiming hold time without a steam-management mechanism",
      "using formats that collapse after 30 minutes in delivery",
    ],
  },
  convenience_retail: {
    channel: "convenience_retail",
    operationalRealities: [
      "cold-chain merchandising",
      "grab-and-go cooler visibility",
      "tight shelf-life requirements",
      "minimal shopper instructions",
      "price-value sensitivity",
      "retail SKUs must read clearly in-pack rather than like plated cafe dishes",
    ],
    preferredFormats: [
      "layered salad pot",
      "chilled noodle salad kit",
      "protein snack box",
      "grain-free vegetable crunch pot",
      "compartmentalized lunch tray",
      "forkable potato-egg-vegetable salad cup",
      "sealed topping sachet or crunch sachet",
    ],
    riskyFormats: [
      "mediterranean quinoa salad",
      "generic chickpea salad",
      "generic asian chicken salad",
      "high-water ingredients without separation",
      "leafy salads that collapse visually",
      "messy dressings mixed too early",
      "formats that rely on last-minute heating or assembly",
    ],
    mustAddress: [
      "water migration",
      "visual vibrancy after storage",
      "cold-chain stability",
      "forkability",
      "shelf-life assumptions",
      "packaging architecture",
      "wet-dry separation",
      "dressing strategy",
      "texture protection",
      "visible shelf appeal",
    ],
    commonFailureModes: [
      "defaulting to mediterranean quinoa as a safe answer",
      "writing restaurant salad descriptions instead of retail-ready SKUs",
      "using cucumber/tomato/herbs without moisture strategy",
      "treating a cooler salad like a made-to-order cafe salad",
      "overstating shelf life without packaging logic",
    ],
  },
  grab_and_go_retail: {
    channel: "grab_and_go_retail",
    operationalRealities: [
      "high footfall and fast selection",
      "one-handed eating matters",
      "premium perception from packaging and build quality",
      "ambient or cold consumption is common",
      "shelf life must protect texture",
    ],
    preferredFormats: [
      "structured sandwich",
      "sealed baguette",
      "pressed handheld",
      "wrapped filled bread with moisture barrier",
      "pocket sandwich",
    ],
    riskyFormats: [
      "loose tartines",
      "overfilled wraps",
      "fragile crisp garnishes",
      "messy sauces",
      "formats that require cutlery",
    ],
    mustAddress: [
      "one-handed eating",
      "sogginess control",
      "48-hour texture protection",
      "premium visual appeal",
      "travel-safe packaging",
    ],
    commonFailureModes: [
      "proposing open-faced or messy formats for commuters",
      "ignoring bread barrier strategy",
      "mistaking premium for complicated",
    ],
  },
  airline_catering: {
    channel: "airline_catering",
    operationalRealities: [
      "galley oven reheating",
      "tray service constraints",
      "low aroma leakage is important",
      "altitude dulls flavor and dries texture",
      "messy handling slows service",
      "the tray architecture must stay tidy during service and turbulence",
    ],
    preferredFormats: [
      "sealed tray bake",
      "compact rice timbale",
      "soft savory cake with sauce well",
      "compartmentalized cold bento",
      "sauced protein and starch tray",
      "low-aroma vegetable ragout",
      "reheatable grain or starch bake",
    ],
    riskyFormats: [
      "tacos",
      "skewers",
      "loose salads",
      "messy sauces",
      "strong-aroma foods",
      "fragile crisp items",
      "avocado creams",
      "quinoa cakes",
    ],
    mustAddress: [
      "galley reheating",
      "tray service",
      "tray architecture",
      "low-aroma strategy",
      "altitude taste adjustment",
      "moisture retention",
      "low-mess eating",
      "allergen clarity",
      "cold-service or reheating method",
    ],
    commonFailureModes: [
      "using generic catering bakes that could belong to any channel",
      "defaulting to quinoa cakes or other vague healthy formats",
      "treating airline food like restaurant plating",
      "using dry or fragile formats that degrade in galleys",
      "ignoring aroma and tray-service realities",
    ],
  },
  supermarket_chilled_ready_meal: {
    channel: "supermarket_chilled_ready_meal",
    operationalRealities: [
      "centralized chilled manufacturing",
      "7-day shelf-life pressure",
      "home microwave is the final cooking step",
      "restaurant-quality promise raises sensory expectations",
      "packaging and sauce behavior are critical",
    ],
    preferredFormats: [
      "sauced tray meal",
      "braised or stewed comfort dish",
      "microwave-friendly rice or pasta bake",
      "component-led ready meal with protected garnish zone",
    ],
    riskyFormats: [
      "dry grain bowls",
      "fragile crisp toppings packed hot",
      "formats that rely on a la minute finishing",
      "thin proteins that overcook in microwave reheating",
    ],
    mustAddress: [
      "microwave regeneration",
      "7-day shelf-life mechanism",
      "sauce stability",
      "post-microwave texture",
      "retail packaging architecture",
    ],
    commonFailureModes: [
      "substituting a lunch bowl for a ready meal",
      "calling something restaurant quality without a regeneration plan",
      "making shelf-life claims with no thermal or moisture logic",
    ],
  },
  bakery_cafe: {
    channel: "bakery_cafe",
    operationalRealities: [
      "pastry case merchandising drives purchase",
      "humidity affects texture and shine",
      "laminated and filled products need holding discipline",
      "premium cafes need visual drama and easy service",
      "regional flavor cues must still feel polished",
    ],
    preferredFormats: [
      "laminated pastry with regional filling logic",
      "glazed viennoiserie",
      "display-friendly tart",
      "structured small pastry with humidity resistance",
    ],
    riskyFormats: [
      "open creams that slump in humidity",
      "syrup-heavy crisp pastries with no barrier plan",
      "delicate shells that absorb ambient moisture quickly",
    ],
    mustAddress: [
      "humidity tolerance",
      "display-case appearance",
      "texture after holding",
      "batch production rhythm",
      "premium visual finish",
    ],
    commonFailureModes: [
      "confusing attractive flavor ideas with display-stable products",
      "ignoring sugar or fat barriers in humid climates",
      "using regional flavors only as garnish",
    ],
  },
  china_qsr_localized: {
    channel: "china_qsr_localized",
    operationalRealities: [
      "speed of lunch assembly matters",
      "rice or noodle set logic needs to feel familiar",
      "value perception and sauce satisfaction matter",
      "localized flavor cues should reflect real Chinese eating occasions",
      "precooked components must still eat as complete meals",
    ],
    preferredFormats: [
      "rice set with sauced protein and separate vegetable side",
      "noodle set with fast-finish sauce pack",
      "regional rice bowl with familiar Chinese sauce logic",
      "bento-style lunch set with heat-stable components",
    ],
    riskyFormats: [
      "generic teriyaki bowls",
      "superficial Japanese or Korean defaults",
      "globally generic health bowls",
      "formats needing assembly beyond 60 seconds",
    ],
    mustAddress: [
      "60-second assembly",
      "familiar sauce architecture",
      "Chinese lunch-set logic",
      "component reheating",
      "value and satiety perception",
    ],
    commonFailureModes: [
      "superficial teriyaki or Japanese defaults when the brief asks for localized China",
      "confusing localization with one token ingredient",
      "ignoring value perception and eating occasion structure",
    ],
  },
  general_foodservice: {
    channel: "general_foodservice",
    operationalRealities: [
      "operational fit matters as much as flavor appeal",
      "constraints should drive format choice",
      "packaging and hold behavior often decide viability",
      "channel expectations shape perceived value",
    ],
    preferredFormats: [
      "format selected from the brief's operating realities",
      "single-step execution product",
      "component-led item with clear serving logic",
    ],
    riskyFormats: [
      "concepts that need unstated equipment",
      "formats with no moisture or hold strategy",
      "ideas that are trendy but channel-inappropriate",
    ],
    mustAddress: [
      "execution reality",
      "packaging or service method",
      "shelf life or hold logic",
      "customer fit",
    ],
    commonFailureModes: [
      "choosing a trendy format before diagnosing the channel",
      "making unsupported feasibility claims",
      "describing a concept attractively without proving it can work",
    ],
  },
};

function normalizeText(value: unknown): string {
  if (!value || typeof value !== "string") return "";
  return value.toLowerCase();
}

function getContextText(context: unknown): string {
  if (!context || typeof context !== "object") return "";
  return JSON.stringify(context).toLowerCase();
}

export function selectChannelPlaybook(brief: string, context: unknown): ChannelPlaybook {
  const briefText = normalizeText(brief);
  const contextText = getContextText(context);
  const haystack = `${briefText}\n${contextText}`;

  if (
    haystack.includes("starbucks") ||
    haystack.includes("coffee chain") ||
    haystack.includes("café chain") ||
    haystack.includes("cafe chain")
  ) {
    return CHANNEL_PLAYBOOKS.cafe_chain;
  }

  if (
    haystack.includes("pizza hut") ||
    haystack.includes("qsr pizza") ||
    (haystack.includes("pizza") && haystack.includes("side dish")) ||
    haystack.includes("delivery window")
  ) {
    return CHANNEL_PLAYBOOKS.qsr_pizza;
  }

  if (
    haystack.includes("convenience store") ||
    haystack.includes("grab-and-go cooler") ||
    haystack.includes("coolers") ||
    haystack.includes("summer salads")
  ) {
    return CHANNEL_PLAYBOOKS.convenience_retail;
  }

  if (
    haystack.includes("train station") ||
    haystack.includes("travel retail") ||
    (haystack.includes("grab-and-go") && haystack.includes("sandwich"))
  ) {
    return CHANNEL_PLAYBOOKS.grab_and_go_retail;
  }

  if (
    haystack.includes("airline") ||
    haystack.includes("galley") ||
    haystack.includes("economy class") ||
    haystack.includes("catering")
  ) {
    return CHANNEL_PLAYBOOKS.airline_catering;
  }

  if (
    haystack.includes("supermarket") ||
    haystack.includes("ready-meal") ||
    haystack.includes("ready meal") ||
    haystack.includes("microwaveable")
  ) {
    return CHANNEL_PLAYBOOKS.supermarket_chilled_ready_meal;
  }

  if (
    haystack.includes("pastry case") ||
    haystack.includes("bakery item") ||
    haystack.includes("bakery concept") ||
    haystack.includes("high ambient humidity")
  ) {
    return CHANNEL_PLAYBOOKS.bakery_cafe;
  }

  if (
    haystack.includes("yum china") ||
    haystack.includes("localized china") ||
    haystack.includes("rice bowl") ||
    haystack.includes("lunch set")
  ) {
    return CHANNEL_PLAYBOOKS.china_qsr_localized;
  }

  return CHANNEL_PLAYBOOKS.general_foodservice;
}
