import type { BriefToPitchOutput } from "./types";
import type { DemoLocale } from "@/lib/brief-to-pitch/copy";

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

export const CN_MOCK_DATA: BriefToPitchOutput = {
  brief: {
    text: "一家连锁咖啡品牌计划推出下一季轻食菜单，希望新品适合年轻白领的午餐和下午茶场景。产品需要有新鲜感、轻负担、适合中央厨房生产，并且门店只具备简单加热条件。",
    context: {
      customerType: "连锁咖啡品牌",
      region: "中国",
      productCategory: "轻食 / 午餐 / 下午茶",
      constraints: "中央厨房生产，门店仅简单加热，无复杂组装",
      targetPriceTier: "中高端大众价位",
      positioning: "新鲜、轻负担、白领友好",
    },
  },
  operationalStrategy: {
    selectedPlaybook: "cafe_chain",
    keyConstraints: [
      "门店仅可简单加热，无完整厨房能力",
      "不适合门店二次组装",
      "需要兼顾午餐饱腹感与轻食形象",
      "要能自然匹配冷萃、冰茶等饮品场景",
    ],
    allowedFormats: [
      "可加热三明治",
      "预组装佛卡夏",
      "手持型咸味烘焙",
      "预组装扁面包口袋",
    ],
    riskyFormats: [
      "已拌汁沙拉",
      "需要现场拼装的冷食碗",
      "多组件摆盘产品",
      "需要完整烹饪的产品",
    ],
    rejectedIdeas: [
      {
        idea: "冷藜麦轻食碗",
        reason: "与门店简单加热能力不匹配，也不足以支撑咖啡渠道午餐场景所需的满足感。",
      },
      {
        idea: "现制卡普雷塞帕尼尼",
        reason: "需要门店装配，且番茄出水会带来保质期和复热后的口感风险。",
      },
    ],
    conceptStrategy:
      "优先选择中央厨房可预组装、门店单步加热即可出品的手持型产品，同时保留新鲜感和轻盈感，让它既像轻食，又具备午餐级满足度。",
  },
  interpretation: {
    targetAudience: "年轻白领与城市通勤人群，希望在午餐或下午茶时段获得更轻负担但不空洞的选择。",
    emotionalKeywords: ["新鲜", "轻盈", "高级感", "高效率", "有满足感"],
    hiddenRequirements: [
      "产品在包装展示时要看起来干净、清爽、有食欲。",
      "中央厨房生产后仍需保持结构稳定，适应冷藏配送与门店简单复热。",
    ],
    constraints: [
      "门店不可复杂组装。",
      "只能做单步加热或直接冷食出品。",
      "新品需要同时适配午餐和下午茶补能场景。",
    ],
  },
  marketSignals: {
    cuisineInspiration: [
      "地中海清爽风味",
      "现代咖啡馆式轻午餐",
      "亚洲白领熟悉的鸡肉与香草组合",
    ],
    trendSignals: [
      "轻负担午餐正在从“低卡”转向“高质感、真满足”。",
      "可视化包装和手持即食形态更适合咖啡零售场景。",
    ],
    seasonalIngredients: ["香草", "柠檬", "烤彩椒", "低水分奶酪"],
  },
  directions: [
    {
      id: "dir-cn-1",
      name: "柠香香草鸡肉佛卡夏",
      conceptLogic: "以结构稳定、加热后外脆内软的佛卡夏为载体，承接柠香鸡肉与咸香奶酪抹酱，兼顾新鲜感和午餐饱腹感。",
      flavorProfile: "柠檬清香、香草气息、烘烤蒜香与轻咸奶香。",
      textureProfile: "外层微脆、内里柔软，鸡肉嫩而不柴。",
      factoryFeasibility: "高。鸡肉可中央厨房预制，佛卡夏载体稳定，整体现有供应链容易承接。",
      whyItFits: "符合咖啡渠道轻午餐逻辑，适配冷饮搭配，也能在门店通过单步加热快速出品。",
      constraintResponse: {
        keyConstraints: ["门店简单加热", "无需门店组装", "兼顾轻负担与饱腹感"],
        howDirectionHandlesConstraints: [
          "产品可中央厨房完成组装，门店只需单次加热即可出品。",
          "使用低水活度抹酱和稳定面包结构，降低冷藏阶段的吸湿风险。",
          "鸡肉蛋白与佛卡夏体量共同支撑午餐级满足感。"
        ],
        unresolvedRisks: [
          "菠菜或湿性配菜的摆放仍需验证，避免冷藏后局部回潮。"
        ]
      },
      operationalFit: {
        productionModel: "中央厨房预组装并冷藏配送到门店。",
        storeExecution: "门店从冷藏柜取出后直接单步加热，再装入纸套出杯式交付。",
        heatingOrHoldingMethod: "高效烤炉短时复热，不需要额外 finishing。",
        shelfLifeStrategy: "假设 72 小时冷藏保质期，依赖低水分抹酱与湿性食材隔离布局。",
        packagingConsiderations: "使用透气纸套与支撑性包装，降低加热后回潮并保持展示感。"
      },
      differentiation: {
        whyThisIsNotGeneric: "不是泛泛的冷食轻沙拉，而是为咖啡门店单步加热出品专门设计的手持型轻午餐。",
        customerSpecificFit: "同时满足品牌想要的新鲜感、轻负担和门店执行简单这三个核心要求。",
        regionalOrChannelFit: "符合中国城市咖啡消费中对“轻食但别太空”的真实期待。"
      },
      riskRating: "Medium",
      confidence: "High"
    },
    {
      id: "dir-cn-2",
      name: "烤彩椒鸡肉软扁面包口袋",
      conceptLogic: "利用柔软但结构稳定的扁面包口袋包裹烤彩椒与鸡肉馅，突出轻食感，同时保持加热后食用便利。",
      flavorProfile: "微甜烤椒、轻烟熏鸡肉、酸奶香草酱。",
      textureProfile: "饼体柔韧、内馅湿润、局部有轻微蔬菜脆感。",
      factoryFeasibility: "中高。馅料和面饼都适合标准化生产，但需要更细致控制馅料含水量。",
      whyItFits: "比传统三明治更有新品感，适合年轻白领，也便于手持边走边吃。",
      constraintResponse: {
        keyConstraints: ["中央厨房生产", "简单加热", "年轻白领场景"],
        howDirectionHandlesConstraints: [
          "中央厨房可完成灌馅和封口，门店无需二次处理。",
          "通过控制烤彩椒含水量和酱体黏度，减少复热后渗漏。",
          "口袋型结构增强通勤和办公室场景的便利性。"
        ],
        unresolvedRisks: [
          "若馅料含水偏高，面饼局部可能在货架后期变软。"
        ]
      },
      operationalFit: {
        productionModel: "标准化灌馅与封装，适合中央厨房批量生产。",
        storeExecution: "门店仅需单步加热或在部分场景下冷食售卖。",
        heatingOrHoldingMethod: "短时复热，避免过烤造成面饼发硬。",
        shelfLifeStrategy: "通过控水蔬菜和稠酱体系，争取 2–3 天冷藏陈列窗口。",
        packagingConsiderations: "口袋型包装配纸托，兼顾手持性和正面展示。"
      },
      differentiation: {
        whyThisIsNotGeneric: "相较常规卷饼，它更像一款为咖啡零售货架打造的结构化新品，而不是随意拼装的 wrap。",
        customerSpecificFit: "更适合追求新鲜感和便携感的年轻白领场景。",
        regionalOrChannelFit: "符合中国咖啡轻食对手持、好拍、好带走的渠道偏好。"
      },
      riskRating: "Medium",
      confidence: "Medium"
    },
    {
      id: "dir-cn-3",
      name: "青酱火鸡轻享卷",
      conceptLogic: "以熟火鸡和青酱为核心，做成可冷食的轻享卷，强调下午茶补能和即拿即走。",
      flavorProfile: "香草青酱、轻奶香、火鸡咸鲜。",
      textureProfile: "卷饼柔软、肉感扎实、蔬菜脆爽。",
      factoryFeasibility: "高。标准卷制结构成熟，但需要处理酱体和叶菜的水分迁移。",
      whyItFits: "冷食即食属性适合部分门店无需加热的快取需求，也容易与冷饮捆绑销售。",
      constraintResponse: {
        keyConstraints: ["即拿即走", "冷藏货架", "轻负担"],
        howDirectionHandlesConstraints: [
          "卷饼可中央厨房直接卷制并冷藏配送。",
          "青酱采用更厚的乳化结构，减少渗漏。",
          "熟火鸡提供足够蛋白支撑，避免产品只剩“轻”没有满足感。"
        ],
        unresolvedRisks: [
          "相较前两个方向，它对门店加热能力的利用不明显，差异化稍弱。"
        ]
      },
      operationalFit: {
        productionModel: "中央厨房冷卷成型，适合标准化切半包装。",
        storeExecution: "可直接冷食售卖，也可视测试结果保留短时微热方案。",
        heatingOrHoldingMethod: "以冷食为主，如需微热需谨慎验证卷饼完整性。",
        shelfLifeStrategy: "依靠蔬菜与酱体分层、吸湿内衬等方式争取 2 天以上冷藏货架期。",
        packagingConsiderations: "半卷纸盒包装，强调可视化与便携性。"
      },
      differentiation: {
        whyThisIsNotGeneric: "不是通用健康卷，而是围绕咖啡零售的冷藏快取与饮品搭配去设计。",
        customerSpecificFit: "适合下午茶、办公室补能和快速午餐转化。",
        regionalOrChannelFit: "更接近中国精品咖啡与连锁咖啡的冷藏陈列消费逻辑。"
      },
      riskRating: "High",
      confidence: "Medium"
    }
  ],
  recipes: [
    {
      id: "rec-cn-1",
      directionId: "dir-cn-1",
      name: "柠香香草鸡肉佛卡夏",
      description: "以预制柠香鸡肉、咸香奶酪抹酱和低含水配菜组成的佛卡夏轻午餐，适合咖啡门店单步加热后快速出品。",
      targetOccasion: "午餐 / 下午茶补能",
      ingredients: [
        "迷迭香佛卡夏面包",
        "柠香香草鸡胸肉切片",
        "菲达酸奶抹酱",
        "风干番茄酸豆酱",
        "少量处理过的嫩菠菜"
      ],
      prepMethod: "中央厨房完成组装并冷藏配送；门店按设定程序单步加热后即可售卖。",
      chefNotes: "抹酱体系要足够稳定，既能带来奶香层次，又不能在冷藏后明显渗水。",
      watchouts: "叶菜和湿性配料摆放顺序必须验证，否则会影响三天货架期末段的面包结构。",
      manufacturingNotes: {
        makeAheadComponents: [
          "鸡肉可采用中心厨房预制和切片。",
          "抹酱与风干番茄酱可提前批量制备。"
        ],
        moistureMigrationControls: [
          "用抹酱作为面包与湿性配料之间的脂肪屏障。",
          "将风干番茄酱集中在中部，避免靠近切边。"
        ],
        textureProtection: [
          "选用组织更紧实的佛卡夏面包体。",
          "复热后使用透气纸套，减少蒸汽回软。"
        ],
        reheatingOrServingInstructions: "从冷藏状态直接复热，出炉后立即装套，建议 5 分钟内售出。",
        estimatedShelfLifeAssumption: "在冷藏密封配送条件下，目标为 72 小时，但仍需进一步验证。"
      },
      validationPlan: {
        chefValidation: [
          "验证复热后柠檬与香草风味是否仍清晰。",
          "确认抹酱在第 3 天仍保持稳定口感。"
        ],
        opsValidation: [
          "验证门店单步加热程序是否稳定。",
          "确认包装与出品动作不会拖慢高峰时段效率。"
        ],
        sensoryValidation: [
          "对比第 1 天与第 3 天的面包和叶菜口感变化。",
          "测试与冷萃、冰茶的搭配感受。"
        ],
        regulatoryOrClaimsValidation: [
          "最终货架期表达需基于真实验证结果。",
          "复核乳制品、麸质等过敏原标识。"
        ]
      },
      constraintChecklist: [
        {
          name: "门店仅简单加热",
          status: "Handled",
          explanation: "产品为门店单步加热设计，无需额外操作。"
        },
        {
          name: "无需门店组装",
          status: "Handled",
          explanation: "中央厨房完成全部组装。"
        },
        {
          name: "轻负担但有满足感",
          status: "Handled",
          explanation: "鸡肉蛋白和佛卡夏体量共同支撑午餐级满足感。"
        },
        {
          name: "适合冷饮搭配",
          status: "Partially handled",
          explanation: "风味方向明确适合冷饮，但仍建议做实际饮品搭配测试。"
        }
      ]
    }
  ],
  pitchPackage: {
    executiveSummary:
      "针对连锁咖啡品牌的下一季轻食菜单，我们建议优先考虑“柠香香草鸡肉佛卡夏”。它兼顾轻食的新鲜感、午餐所需的满足感，以及中央厨房生产和门店单步加热的运营现实，适合作为白领场景下的高质感手持轻午餐。",
    gammaPrompt:
      "请制作一份 5 页中文提案。第 1 页：项目标题“下一季轻食新品提案”。第 2 页：客户 Brief 与核心限制。第 3 页：市场与风味信号。第 4 页：主推方案“柠香香草鸡肉佛卡夏”。第 5 页：中央厨房生产与门店执行优势。"
  },
  imagePrompts: [
    "一款高质感柠香鸡肉佛卡夏轻食，摆放在咖啡店桌面旁边配冷萃咖啡，自然日光，真实食品摄影，16:9",
    "近景展示复热后的佛卡夏剖面，鸡肉、奶酪抹酱和风干番茄层次清晰，精致咖啡馆风格，4:3"
  ]
};

export function getMockData(locale: DemoLocale): BriefToPitchOutput {
  return locale === "cn" ? CN_MOCK_DATA : STARBUCKS_MOCK_DATA;
}
