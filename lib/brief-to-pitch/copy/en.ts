import type { BriefToPitchCopy } from "./types";

export const enCopy: BriefToPitchCopy = {
  locale: "en",
  routes: {
    en: "/rnd-ai-hub-en",
    cn: "/rnd-ai-hub-cn",
  },
  nav: {
    brand: "Fresh Food Copilot",
    productLabel: "Brief-to-Pitch",
    requestDemo: "Request Demo",
    languageToggleLabel: "Language switcher",
    cn: "CN",
    en: "EN",
  },
  hero: {
    badge: "Fresh Food Brief-to-Pitch Copilot",
    heading: "Turn customer menu briefs into",
    headingAccent: "pitch-ready",
    headingSuffix: "food concepts.",
    subheading:
      "Analyze the brief, identify market and cuisine signals, generate R&D directions, create recipe concepts, and prepare Gamma-ready proposal content.",
    primaryCta: "Try the demo",
    secondaryCta: "View sample proposal flow",
    tagsLabel: "Key features",
    tags: ["International-first", "Specific & actionable", "Operationally realistic"],
    previewTitle: "Brief-to-Pitch Workflow",
    previewSubtitle: "Fast, specific, actionable",
    previewReady: "Ready",
    previewIntro:
      "Welcome to the Fresh Food Copilot. Paste your customer brief to generate R&D directions and Gamma-ready pitches.",
    previewSampleBrief:
      "We are looking for a new savory food item to add to our summer seasonal menu...",
    previewDirectionLabel: "Direction 1:",
    previewDirectionName: "Mediterranean Lemon-Herb Chicken Focaccia",
    previewWhyItFitsLabel: "Why it fits:",
    previewWhyItFitsText:
      "Pairs excellently with cold brews; feels premium but is a single-step heat.",
    previewButtons: ["Starbucks Summer Menu", "Yum China Lunch"],
  },
  input: {
    heading: "Paste Customer Brief",
    intro: "Start by pasting a customer menu brief, meeting notes, or seasonal theme.",
    privacyNotice:
      "Privacy notice: This is a public demo. Avoid pasting confidential customer briefs.",
    placeholder:
      "e.g., We are looking for a new savory food item to add to our summer seasonal menu...",
    sampleLabel: "Try a sample:",
    generateCta: "Generate Concepts",
    samples: [
      {
        label: "Starbucks Seasonal Menu",
        text: "We are looking for a new savory food item to add to our summer seasonal menu. It should be light, fresh, but satisfying enough for a quick lunch. Must pair well with our iced teas and cold brews. We want something that feels 'premium' but is easy to execute in our stores (we only have warming ovens, no full kitchen). Target price point is $7-$9.",
        context: {
          customerType: "Café Chain",
          region: "North America",
          productCategory: "Lunch / Snack",
          constraints: "Store warming only, no assembly",
          targetPriceTier: "Premium Mass ($7-$9)",
          positioning: "Summer Fresh & Light",
        },
      },
      {
        label: "Yum China Lunch (Coming soon)",
        text: "",
        context: {},
        disabled: true,
      },
    ],
  },
  processing: {
    heading: "Processing Brief...",
    intro:
      "This may take 20–40 seconds while we build your proposal package, check operational fit, and make sure the output is pitch-ready.",
    steps: [
      "Reading the brief",
      "Diagnosing constraints and channel fit",
      "Building your proposal package...",
      "Checking operational fit and pitch readiness...",
      "Finalizing directions, recipe, and pitch package",
    ],
    finalMessage:
      "Final checks are running now so the package feels intentional, operationally grounded, and ready to present.",
    errorPrefix: "Generation Error:",
    fallbackCta: "Use sample Starbucks demo instead",
  },
  output: {
    heading: "Proposal Package",
    startOver: "Start Over",
    disclaimerLabel: "Disclaimer:",
    disclaimerText:
      "These outputs are AI-generated concept directions for proposal development. Final recipes, claims, costs, and production feasibility should be validated by chefs, R&D, regulatory, and operations teams.",
    sections: {
      interpretation: "Brief Interpretation",
      targetAudience: "Target Audience",
      emotionalKeywords: "Emotional Keywords",
      constraints: "Constraints",
      hiddenRequirements: "Hidden Requirements",
      marketSignals: "Market & Cuisine Signals",
      trendSignals: "Trend Signals",
      cuisineInspiration: "Cuisine Inspiration",
      operationalStrategy: "Operational Strategy",
      playbook: "Playbook",
      keyConstraints: "Key Constraints",
      conceptStrategy: "Concept Strategy",
      allowedFormats: "Allowed Formats",
      riskyFormats: "Risky Formats",
      rejectedIdeas: "Rejected Ideas",
      directions: "R&D Directions",
      recipes: "Recipe Concepts",
      pitchPackage: "Pitch Package (Gamma-ready)",
      imagePrompts: "Image Generation Prompts",
    },
    direction: {
      risk: "Risk",
      confidence: "Confidence",
      mostImportantConstraintResponse: "Most Important Constraint Response",
      shelfLifeStrategy: "Shelf-Life Strategy",
      whyItIsNotGeneric: "Why It Is Not Generic",
      flavor: "Flavor",
      feasibility: "Feasibility",
      storeExecution: "Store Execution",
      heatingHolding: "Heating/Holding",
      packaging: "Packaging",
      customerFit: "Customer Fit",
      unresolvedRisks: "Unresolved Risks",
    },
    recipe: {
      ingredients: "Ingredients",
      chefNotes: "Chef Notes",
      manufacturingNotes: "Manufacturing Notes",
      makeAheadPrefix: "Make-ahead",
      moistureControlPrefix: "Moisture control",
      textureProtectionPrefix: "Texture protection",
      service: "Service",
      shelfLifeAssumption: "Shelf-Life Assumption",
      constraintChecklist: "Constraint Checklist",
      validationPlan: "Validation Plan",
      chefValidationPrefix: "Chef",
      opsValidationPrefix: "Ops",
      sensoryValidationPrefix: "Sensory",
      regulatoryValidationPrefix: "Regulatory/claims",
    },
    pitch: {
      copyGammaPrompt: "Copy Gamma Prompt",
      copySuccessAlert: "Copied to clipboard!",
    },
    leadCapture: {
      heading: "Want to share this proposal?",
      description:
        "Get the full concept package sent to your email, or talk to us about building a custom workflow for your own R&D team.",
      sendToEmail: "Send to my email",
      requestEnterpriseDemo: "Request enterprise demo",
    },
  },
  modal: {
    emailTitle: "Export this Proposal",
    demoTitle: "Request Enterprise Demo",
    emailDescription:
      "Enter your email to receive this full pitch package (including all recipes and Gamma prompts).",
    demoDescription:
      "Enter your email and we'll reach out to schedule a demo of how this copilot works with your own R&D team and factory constraints.",
    emailPlaceholder: "work@email.com",
    submit: "Submit",
    successTitle: "Request Received",
    successDescription: "Check your inbox shortly.",
  },
  errors: {
    genericGenerationFailed: "An unexpected error occurred.",
  },
};
