import type { BriefToPitchOutput } from "./types";

export const STARBUCKS_MOCK_DATA: BriefToPitchOutput = {
  brief: {
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
  operationalStrategy: {
    selectedPlaybook: "cafe_chain",
    keyConstraints: [
      "Store warming only with no full kitchen",
      "No in-store assembly",
      "Need premium lunch appeal at $7-$9",
      "Must pair naturally with iced teas and cold brews",
    ],
    allowedFormats: [
      "warmable sandwich",
      "stuffed focaccia",
      "filled pastry",
      "pre-assembled flatbread pocket",
    ],
    riskyFormats: [
      "dressed salad",
      "chilled bowl requiring assembly",
      "multi-component plated dish",
      "products requiring full cooking",
    ],
    rejectedIdeas: [
      {
        idea: "Cold quinoa salad bowl",
        reason: "Conflicts with oven-only execution and would underdeliver on the satisfying lunch brief inside a coffee-led service line.",
      },
      {
        idea: "Made-to-order caprese panini",
        reason: "Requires assembly and garnish discipline the stores do not have, and tomato moisture would create holding problems.",
      },
    ],
    conceptStrategy:
      "Stay inside warmable, pre-assembled handheld formats that can move from chilled distribution to a single oven cycle while still feeling premium and beverage-friendly.",
  },
  interpretation: {
    targetAudience: "Young professionals and students seeking a quick, refreshing, yet satisfying light lunch.",
    emotionalKeywords: ["Fresh", "Light", "Premium", "Summer-ready", "Energizing"],
    hiddenRequirements: [
      "Must have a high moisture barrier if using wet ingredients, to prevent sogginess during shelf life.",
      "Needs to hold structural integrity when heated rapidly in high-speed ovens.",
    ],
    constraints: [
      "No in-store assembly allowed.",
      "Heating must be done in a single step (TurboChef/Merrychef).",
      "COGS must be tight enough to support a $7-$9 retail price while maintaining café margins."
    ],
  },
  marketSignals: {
    cuisineInspiration: [
      "Mediterranean light bites (feta, sun-dried tomatoes, lemon)",
      "Modern Californian (avocado, lean poultry, clean grains)"
    ],
    trendSignals: [
      "Rise of 'functional fresh'—ingredients that feel hydrating and light in hot weather.",
      "High-protein vegetarian options are growing 15% YoY in café channels."
    ],
    seasonalIngredients: [
      "Heirloom tomatoes",
      "Summer squash",
      "Basil",
      "Citrus profiles"
    ],
  },
  directions: [
    {
      id: "dir-1",
      name: "Mediterranean Lemon-Herb Chicken Focaccia",
      conceptLogic: "Uses a sturdy, olive-oil rich focaccia that toasts perfectly in high-speed ovens without drying out, providing a satisfying but light bite.",
      flavorProfile: "Zesty, herbaceous, savory with a hint of roasted garlic.",
      textureProfile: "Crispy exterior, soft airy crumb, tender chicken.",
      factoryFeasibility: "High. Chicken can be pre-marinated and cooked sous-vide for yield. Focaccia is highly stable.",
      whyItFits: "Pairs excellently with cold brews; the lemon profile enhances iced tea pairings. Feels premium but is a single-step heat.",
      constraintResponse: {
        keyConstraints: ["Store warming only", "No in-store assembly", "$7-$9 target price"],
        howDirectionHandlesConstraints: [
          "Ships fully assembled and only needs a single TurboChef reheat step in store.",
          "Uses stable focaccia and low-water spreads to keep the build intact before heating.",
          "Protein portioning and bread format keep the cost structure within premium mass pricing."
        ],
        unresolvedRisks: [
          "Spinach placement and sauce viscosity still need validation to confirm no edge sogginess during chilled holding."
        ]
      },
      operationalFit: {
        productionModel: "Central commissary assembly with chilled distribution to stores.",
        storeExecution: "Remove from chilled case, heat once, and sleeve for handoff.",
        heatingOrHoldingMethod: "TurboChef or Merrychef high-speed oven, short single-pass heat with no finishing step.",
        shelfLifeStrategy: "Three-day chilled shelf-life assumption using low-water-activity spreads and separated relish placement.",
        packagingConsiderations: "Crisping sleeve plus breathable sandwich wedge to protect crust without steaming."
      },
      differentiation: {
        whyThisIsNotGeneric: "The concept is anchored in a warm cafe sandwich format optimized for oven-only execution rather than defaulting to a cold salad or wrap.",
        customerSpecificFit: "Built for beverage attachment, premium lunch perception, and a single-step cafe workflow.",
        regionalOrChannelFit: "North American cafe customers understand focaccia sandwiches, but the flavor profile still feels seasonal and elevated."
      },
      riskRating: "Medium",
      confidence: "High"
    },
    {
      id: "dir-2",
      name: "Summer Caprese Artisan Flatbread",
      conceptLogic: "A vegetarian option that screams summer. Uses a moisture-controlled pesto and slow-roasted tomatoes to prevent a soggy base.",
      flavorProfile: "Rich basil, sweet roasted tomato, creamy mozzarella.",
      textureProfile: "Crunchy flatbread base, gooey cheese, burst tomatoes.",
      factoryFeasibility: "Medium. Moisture migration from tomatoes requires a barrier layer (like a thick pesto or infused oil) on the bread.",
      whyItFits: "Hits the vegetarian demand. Very light and fresh. Easy to execute and highly profitable.",
      constraintResponse: {
        keyConstraints: ["Store warming only", "No assembly", "Premium summer positioning"],
        howDirectionHandlesConstraints: [
          "Uses fully topped flatbread that can move straight from chill to oven with no finishing garnish.",
          "Slow-roasted tomatoes and thick pesto reduce free water compared with a fresh caprese build.",
          "Format reads premium in the pastry or lunch case while staying operationally simple."
        ],
        unresolvedRisks: [
          "Mozzarella blistering and basil darkening need heat-program tuning.",
          "Flatbread edge drying after prolonged holding remains a partial risk."
        ]
      },
      operationalFit: {
        productionModel: "Par-baked flatbread topped in commissary and distributed chilled.",
        storeExecution: "Heat-to-order with no slicing or garnish required.",
        heatingOrHoldingMethod: "Rapid oven finish with a short window before service to preserve crust.",
        shelfLifeStrategy: "Two-to-three-day chilled shelf-life assumption with reduced-moisture cheese and roasted tomato moisture management.",
        packagingConsiderations: "Rigid tray and vented sleeve to protect topping position and limit condensation."
      },
      differentiation: {
        whyThisIsNotGeneric: "The concept earns the summer cue through baked tomato concentration and hot-case execution instead of defaulting to a cold Mediterranean salad profile.",
        customerSpecificFit: "Adds a premium vegetarian offer that still works inside a coffee-led lunch occasion.",
        regionalOrChannelFit: "Flatbread is familiar in North American cafes, but the build is tuned for pastry-case adjacency and rapid warm service."
      },
      riskRating: "Medium",
      confidence: "Medium"
    },
    {
      id: "dir-3",
      name: "Smoked Turkey & Avocado Green Goddess Wrap",
      conceptLogic: "A cold-served or lightly warmed wrap utilizing a spinach tortilla and a vibrant green goddess dressing.",
      flavorProfile: "Creamy, herbaceous, slightly smoky.",
      textureProfile: "Soft wrap, crisp greens, tender turkey.",
      factoryFeasibility: "High. Standard assembly. Avocado must be treated (HPP or citrus) to prevent browning during shelf life.",
      whyItFits: "Extremely popular flavor profile, hits the premium note, very light.",
      constraintResponse: {
        keyConstraints: ["Store warming only", "No assembly", "Fast lunch service"],
        howDirectionHandlesConstraints: [
          "Can be sold cold with no assembly, which reduces labor pressure during lunch rush.",
          "Uses treated avocado and a thick dressing to reduce browning and leakage.",
          "Wrap format keeps the item portable for grab-and-go customers."
        ],
        unresolvedRisks: [
          "This concept is weaker for oven-only stores because it does not benefit from warming as clearly as the sandwich and flatbread directions."
        ]
      },
      operationalFit: {
        productionModel: "Cold-assembled commissary wrap with chilled distribution.",
        storeExecution: "Display in chilled case and serve as-is, with optional light warm cycle only if texture tests support it.",
        heatingOrHoldingMethod: "Primarily cold service; only a brief optional warm if tortilla integrity survives.",
        shelfLifeStrategy: "Two-day chilled shelf-life assumption using avocado treatment and greens isolated from wet dressing.",
        packagingConsiderations: "Half-wrap carton with absorbent insert to catch any residual sauce movement."
      },
      differentiation: {
        whyThisIsNotGeneric: "The wrap is positioned as a traffic-driving cold-case option rather than a vague healthy lunch catch-all.",
        customerSpecificFit: "Targets younger cafe customers who want something recognizable, premium-coded, and easy to carry with a beverage.",
        regionalOrChannelFit: "Green goddess and smoked turkey are highly legible in contemporary North American cafe merchandising."
      },
      riskRating: "High",
      confidence: "Medium"
    }
  ],
  recipes: [
    {
      id: "rec-1",
      directionId: "dir-1",
      name: "Lemon-Herb Chicken Focaccia Sandwich",
      description: "A premium café sandwich featuring sous-vide lemon-herb chicken breast, whipped feta spread, and sun-dried tomato relish on rosemary focaccia.",
      targetOccasion: "Light Lunch",
      ingredients: [
        "Rosemary Olive Oil Focaccia (100g)",
        "Sous-vide Lemon-Herb Chicken Slices (60g)",
        "Whipped Feta & Greek Yogurt Spread (20g)",
        "Sun-dried Tomato & Caper Relish (15g)",
        "Baby Spinach (5g - moisture barrier treated)"
      ],
      prepMethod: "Thaw and serve, or TurboChef heat (275°C for 45s).",
      chefNotes: "The feta spread must have a low water activity to prevent soaking the focaccia over a 3-day shelf life. Consider adding a touch of cream cheese for stabilization.",
      watchouts: "Spinach wilting if heated too aggressively. May need to position chicken over spinach to protect it.",
      manufacturingNotes: {
        makeAheadComponents: [
          "Sous-vide lemon-herb chicken cooked, chilled, and sliced centrally.",
          "Whipped feta spread batched with stabilized dairy base.",
          "Sun-dried tomato relish cooked down to a low-free-water texture."
        ],
        moistureMigrationControls: [
          "Spread the feta layer directly onto bread as a fat barrier.",
          "Keep relish as a tight strip away from the cut edge.",
          "Use treated spinach in a low-load layer under the chicken."
        ],
        textureProtection: [
          "Use focaccia with a denser crumb to resist sauce soak.",
          "Apply a crisping sleeve during reheat to vent steam.",
          "Limit post-heat hold time to avoid crust softening."
        ],
        reheatingOrServingInstructions: "Heat from chilled in a high-speed oven for one short cycle, sleeve immediately, and serve within 5 minutes.",
        estimatedShelfLifeAssumption: "Assumes 72 hours chilled under sealed distribution, pending moisture and texture validation."
      },
      validationPlan: {
        chefValidation: [
          "Confirm lemon-herb intensity still reads after high-speed reheat.",
          "Tune feta spread viscosity to avoid oil break."
        ],
        opsValidation: [
          "Validate one-step cafe reheat across TurboChef and Merrychef programs.",
          "Confirm sleeve pack-out does not slow service during lunch peaks."
        ],
        sensoryValidation: [
          "Run day-1 versus day-3 texture comparison on crust and spinach.",
          "Test beverage pairing with iced tea and cold brew."
        ],
        regulatoryOrClaimsValidation: [
          "Confirm shelf-life statement remains an internal assumption only until validated.",
          "Review allergen declaration for dairy and gluten."
        ]
      },
      constraintChecklist: [
        {
          name: "Store warming only",
          status: "Handled",
          explanation: "The item is designed for a single high-speed oven reheat with no finishing step."
        },
        {
          name: "No in-store assembly",
          status: "Handled",
          explanation: "The sandwich ships fully built from the commissary."
        },
        {
          name: "Light but satisfying lunch",
          status: "Handled",
          explanation: "Lean chicken and bright dairy-herb flavors keep it fresh while the focaccia adds enough substance."
        },
        {
          name: "$7-$9 premium price point",
          status: "Partially handled",
          explanation: "The format looks premium, but portion cost still needs validation against cafe margin targets."
        }
      ]
    }
  ],
  pitchPackage: {
    executiveSummary: "To capture the summer lunch occasion, we propose the Mediterranean Lemon-Herb Chicken Focaccia. It delivers a premium, light flavor profile that pairs flawlessly with cold beverages, while utilizing a highly stable bread carrier optimized for high-speed café ovens.",
    gammaPrompt: "Create a 5-slide presentation. Slide 1: Title 'Summer Seasonal Food Innovation'. Slide 2: The Brief (Light, fresh, $7-$9, pairs with iced tea). Slide 3: Market Signals (Mediterranean influence, functional fresh). Slide 4: Concept: Lemon-Herb Chicken Focaccia. Slide 5: Factory & Execution Advantages (No assembly, stable shelf life)."
  },
  imagePrompts: [
    "A bright, airy flatlay of a lemon-herb chicken sandwich on rosemary focaccia, next to an iced coffee on a marble café table, natural summer sunlight, photorealistic food photography --ar 16:9",
    "Close up macro shot of melted feta and sun-dried tomatoes inside a toasted artisanal focaccia bread, premium café food styling, appetizing, 8k --ar 4:3"
  ]
};
