import { NextResponse } from "next/server";
import { getOpenAIClient } from "@/lib/openai-client";
import { checkRateLimit } from "@/lib/rate-limit";
import { selectChannelPlaybook } from "@/lib/brief-to-pitch/channel-playbooks";

export const maxDuration = 45; // Vercel setting (ignored on Cloudflare, but good practice)

const isLocale = (value: unknown): value is "en" | "cn" =>
  value === "en" || value === "cn";

const getErrorCopy = (locale: "en" | "cn") => ({
  tooManyRequests: locale === "cn" ? "请求过于频繁，请稍后再试。" : "Too many requests. Please wait.",
  requestTooLarge: locale === "cn" ? "请求内容过大。" : "Request too large.",
  briefRequired: locale === "cn" ? "必须填写 Brief。" : "Brief is required.",
  briefTooLong: locale === "cn" ? "Brief 内容过长。" : "Brief is too long.",
  emptyResponse: locale === "cn" ? "AI 返回内容为空。" : "Empty response from AI.",
  timedOut: locale === "cn" ? "生成超时，请尝试更简洁的 Brief。" : "Generation timed out. Please try a simpler brief.",
  failed: locale === "cn" ? "生成失败。" : "Generation failed.",
});

export async function POST(req: Request) {
  let locale: "en" | "cn" = "en";
  try {
    // Basic IP/Session Rate Limiting
    const ip = req.headers.get("x-forwarded-for") || "unknown";
    const rl = checkRateLimit(`demo-generate-${ip}`);
    const body = await req.json();
    locale = isLocale(body.locale) ? body.locale : "en";
    const errorCopy = getErrorCopy(locale);
    const { brief, context } = body;

    if (!rl.allowed) {
      return NextResponse.json({ error: errorCopy.tooManyRequests }, { status: 429 });
    }

    const contentLength = req.headers.get("content-length");
    if (contentLength && parseInt(contentLength, 10) > 1024 * 10) {
      return NextResponse.json({ error: errorCopy.requestTooLarge }, { status: 413 });
    }

    if (!brief || typeof brief !== "string" || brief.trim().length === 0) {
      return NextResponse.json({ error: errorCopy.briefRequired }, { status: 400 });
    }
    if (brief.length > 3000) {
      return NextResponse.json({ error: errorCopy.briefTooLong }, { status: 400 });
    }

    const openai = getOpenAIClient();
    const model = process.env.DEMO_GENERATION_MODEL || "gpt-4o-mini";
    const playbook = selectChannelPlaybook(brief, context);

    const systemPrompt = `You are a world-class food & beverage innovation R&D chef.
Your task is to analyze a customer menu brief and generate a highly specific, commercially actionable, and operationally realistic pitch package that reads like supplier-side R&D proposal thinking, not generic menu ideation.
Follow this generation flow:
Brief
-> constraint diagnosis
-> channel and operation reality
-> allowed and risky formats
-> R&D strategy
-> concept directions
-> recipe concept
-> pitch package

Follow these rules strictly:
1. International-first: Assume a global foodservice context unless explicitly regional.
2. Specific: Avoid vague marketing filler. Name actual ingredients, flavor notes, and prep methods.
3. First diagnose constraints before generating concepts.
4. Select the most relevant channel playbook and use it to decide which formats are allowed versus risky.
5. Operationally realistic: Heavily factor in the provided constraints (e.g., equipment limits). Do not propose concepts that ignore them.
6. Generate allowedFormats and riskyFormats before concept directions.
7. Reject at least 2 tempting but poor-fit ideas before finalizing concepts.
8. Do not generate concepts that appear in riskyFormats unless you explicitly justify the exception in the reasoning.
9. Every direction must reference at least one allowed format or explain why it is an exception.
10. Every recipe must include a concrete mechanism for the hardest operational constraint.
11. Foodservice-aware: Acknowledge shelf life, yield, moisture migration, heating times, and packaging behavior where relevant.
12. Gamma-ready: The output must include a direct prompt for Gamma to create a stunning presentation.
13. Honest: Be clear about assumptions and always indicate where chef/R&D/regulatory validation is required in your notes/watchouts.
14. No fake certainty: Do not invent false metrics or claim a recipe is production-ready without a lab trial.
15. Do not claim shelf life, heat-hold, delivery durability, microwaveability, or factory feasibility without a mechanism.
16. If a concept does not fully fit a constraint, revise it or mark the risk clearly as unresolved.
17. Avoid repeating the same cuisine logic or product format across unrelated briefs.
18. For region-specific briefs, localization must be based on eating occasion, channel behavior, menu architecture, flavor logic, and operational context, not just adding one regional ingredient.
19. Avoid defaulting to Mediterranean quinoa, generic wraps, generic bowls, generic flatbreads, teriyaki, or avocado cream unless the brief clearly supports them.
20. If the brief is region-specific, localize deeply through flavor logic, eating occasion, menu architecture, operational context, and consumer expectations.
21. For airline catering, explicitly consider galley reheating, tray service, low aroma leakage, altitude taste dulling, moisture retention, low-mess eating, and allergen clarity.
22. For convenience retail and chilled ready meals, explicitly consider cold-chain stability, water migration, packaging, shelf-life assumptions, visual appeal after storage, and microwave or no-heat execution.
23. For cafe and QSR briefs, explicitly consider store equipment, speed of service, hold time, batch prep, staff skill level, and beverage pairing or attachment opportunities.
24. Before finalizing, do a diversity check. If your concepts rely on overused default patterns such as Mediterranean quinoa salad, generic wraps, grain bowls, flatbreads, teriyaki, or avocado cream, replace at least two concepts with more customer-specific alternatives.
25. Use the schema to show your work. The operational and validation fields are mandatory reasoning outputs, not optional notes.
26. The operationalStrategy section must be filled first and must constrain the directions that follow.
27. For convenience retail, do not use quinoa, Mediterranean, generic chickpea salad, or generic Asian chicken salad as the lead concept unless the brief explicitly asks for them.
28. For convenience retail, fresh salad concepts must include packaging architecture, wet-dry separation, dressing strategy, texture protection, visible shelf appeal, and a realistic shelf-life assumption.
29. For convenience retail, prefer retail-specific formats such as layered salad pots, chilled noodle salad kits, protein snack boxes, grain-free vegetable crunch pots, compartmentalized lunch trays, forkable potato-egg-vegetable salad cups, and sealed topping or crunch sachets.
30. For convenience retail, reject at least 2 generic salad concepts before finalizing, and product names should sound like retail SKUs rather than restaurant menu descriptions.
31. For airline catering, do not use quinoa cakes, avocado cream, tacos, skewers, loose salads, fragile crisp items, or messy sauces.
32. For airline catering, every concept must include tray architecture, galley reheating method or cold-service method, low-aroma strategy, altitude taste adjustment, moisture retention mechanism, low-mess eating logic, and allergen or dietary clarity.
33. For airline catering, prefer airline-specific formats such as sealed tray bakes, compact rice timbales, soft savory cakes with sauce wells, compartmentalized cold bentos, sauced protein and starch trays, low-aroma vegetable ragouts, and reheatable grain or starch bakes.
34. For airline catering, reject at least 2 generic catering ideas before finalizing, and product names should sound like airline tray concepts rather than restaurant plates.
35. The response language depends on locale. If locale is "en", write all human-facing content in English. If locale is "cn", write all human-facing content in Simplified Chinese.
36. Keep the JSON schema keys exactly as provided in English.
37. Keep all enum tokens required by the schema exactly as specified in English, including riskRating, confidence, and constraintChecklist.status values.

Format the output strictly according to the requested JSON schema. Generate exactly 3 R&D directions and 1 detailed recipe concept for the strongest direction.
Do not output chain-of-thought. Output only the structured result.`;

    const userPrompt = `Customer Brief:
"""
${brief}
"""

Context Details:
${context ? JSON.stringify(context, null, 2) : "None provided."}

Selected Channel Playbook:
${JSON.stringify(playbook, null, 2)}

Requested locale:
${locale}

Instructions for this brief:
- Diagnose the hardest operational constraint before ideating.
- Use the selected playbook unless the brief clearly overrides it.
- Fill operationalStrategy first.
- In operationalStrategy.rejectedIdeas, include at least 2 tempting but poor-fit ideas and explain why they fail this brief.
- Keep directions consistent with operationalStrategy.allowedFormats and operationalStrategy.riskyFormats.
- If you use an exception format, justify it explicitly in the direction reasoning.
- If the selected playbook is convenience_retail:
  - Product names should read like retail SKUs, not plated restaurant dishes.
  - Do not let Mediterranean quinoa, generic chickpea salad, or generic Asian chicken salad become the lead answer unless the brief strongly supports it.
  - The lead concept should show in-pack logic: components, separation, dressing, crunch, and visible shelf appeal.
- If the selected playbook is airline_catering:
  - Product names should read like airline tray concepts.
  - Explain the tray architecture and reheating or cold-service logic clearly.
  - Do not fall back to quinoa cakes or generic healthy bakes with vague service logic.
- If locale is "cn", all titles, summaries, bullets, and prompts should read naturally in Simplified Chinese for Chinese food R&D and supplier teams.
- If locale is "en", keep the output in clear proposal-ready English.

Please generate the structured R&D proposal package now.`;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 40000); // 40s timeout

    const response = await openai.chat.completions.create({
      model,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "brief_to_pitch_output",
          strict: true,
          schema: {
            type: "object",
            properties: {
              operationalStrategy: {
                type: "object",
                properties: {
                  selectedPlaybook: { type: "string" },
                  keyConstraints: { type: "array", items: { type: "string" } },
                  allowedFormats: { type: "array", items: { type: "string" } },
                  riskyFormats: { type: "array", items: { type: "string" } },
                  rejectedIdeas: {
                    type: "array",
                    minItems: 2,
                    items: {
                      type: "object",
                      properties: {
                        idea: { type: "string" },
                        reason: { type: "string" }
                      },
                      required: ["idea", "reason"],
                      additionalProperties: false
                    }
                  },
                  conceptStrategy: { type: "string" }
                },
                required: ["selectedPlaybook", "keyConstraints", "allowedFormats", "riskyFormats", "rejectedIdeas", "conceptStrategy"],
                additionalProperties: false
              },
              interpretation: {
                type: "object",
                properties: {
                  targetAudience: { type: "string" },
                  emotionalKeywords: { type: "array", items: { type: "string" } },
                  hiddenRequirements: { type: "array", items: { type: "string" } },
                  constraints: { type: "array", items: { type: "string" } }
                },
                required: ["targetAudience", "emotionalKeywords", "hiddenRequirements", "constraints"],
                additionalProperties: false
              },
              marketSignals: {
                type: "object",
                properties: {
                  cuisineInspiration: { type: "array", items: { type: "string" } },
                  trendSignals: { type: "array", items: { type: "string" } },
                  seasonalIngredients: { type: "array", items: { type: "string" } }
                },
                required: ["cuisineInspiration", "trendSignals", "seasonalIngredients"],
                additionalProperties: false
              },
              directions: {
                type: "array",
                minItems: 3,
                maxItems: 3,
                items: {
                  type: "object",
                  properties: {
                    id: { type: "string" },
                    name: { type: "string" },
                    conceptLogic: { type: "string" },
                    flavorProfile: { type: "string" },
                    textureProfile: { type: "string" },
                    factoryFeasibility: { type: "string" },
                    whyItFits: { type: "string" },
                    constraintResponse: {
                      type: "object",
                      properties: {
                        keyConstraints: { type: "array", items: { type: "string" } },
                        howDirectionHandlesConstraints: { type: "array", items: { type: "string" } },
                        unresolvedRisks: { type: "array", items: { type: "string" } }
                      },
                      required: ["keyConstraints", "howDirectionHandlesConstraints", "unresolvedRisks"],
                      additionalProperties: false
                    },
                    operationalFit: {
                      type: "object",
                      properties: {
                        productionModel: { type: "string" },
                        storeExecution: { type: "string" },
                        heatingOrHoldingMethod: { type: "string" },
                        shelfLifeStrategy: { type: "string" },
                        packagingConsiderations: { type: "string" }
                      },
                      required: ["productionModel", "storeExecution", "heatingOrHoldingMethod", "shelfLifeStrategy", "packagingConsiderations"],
                      additionalProperties: false
                    },
                    differentiation: {
                      type: "object",
                      properties: {
                        whyThisIsNotGeneric: { type: "string" },
                        customerSpecificFit: { type: "string" },
                        regionalOrChannelFit: { type: "string" }
                      },
                      required: ["whyThisIsNotGeneric", "customerSpecificFit", "regionalOrChannelFit"],
                      additionalProperties: false
                    },
                    riskRating: { type: "string", enum: ["Low", "Medium", "High"] },
                    confidence: { type: "string", enum: ["Low", "Medium", "High"] }
                  },
                  required: [
                    "id",
                    "name",
                    "conceptLogic",
                    "flavorProfile",
                    "textureProfile",
                    "factoryFeasibility",
                    "whyItFits",
                    "constraintResponse",
                    "operationalFit",
                    "differentiation",
                    "riskRating",
                    "confidence"
                  ],
                  additionalProperties: false
                }
              },
              recipes: {
                type: "array",
                minItems: 1,
                maxItems: 1,
                items: {
                  type: "object",
                  properties: {
                    id: { type: "string" },
                    directionId: { type: "string" },
                    name: { type: "string" },
                    description: { type: "string" },
                    targetOccasion: { type: "string" },
                    ingredients: { type: "array", items: { type: "string" } },
                    prepMethod: { type: "string" },
                    chefNotes: { type: "string" },
                    watchouts: { type: "string" },
                    manufacturingNotes: {
                      type: "object",
                      properties: {
                        makeAheadComponents: { type: "array", items: { type: "string" } },
                        moistureMigrationControls: { type: "array", items: { type: "string" } },
                        textureProtection: { type: "array", items: { type: "string" } },
                        reheatingOrServingInstructions: { type: "string" },
                        estimatedShelfLifeAssumption: { type: "string" }
                      },
                      required: [
                        "makeAheadComponents",
                        "moistureMigrationControls",
                        "textureProtection",
                        "reheatingOrServingInstructions",
                        "estimatedShelfLifeAssumption"
                      ],
                      additionalProperties: false
                    },
                    validationPlan: {
                      type: "object",
                      properties: {
                        chefValidation: { type: "array", items: { type: "string" } },
                        opsValidation: { type: "array", items: { type: "string" } },
                        sensoryValidation: { type: "array", items: { type: "string" } },
                        regulatoryOrClaimsValidation: { type: "array", items: { type: "string" } }
                      },
                      required: ["chefValidation", "opsValidation", "sensoryValidation", "regulatoryOrClaimsValidation"],
                      additionalProperties: false
                    },
                    constraintChecklist: {
                      type: "array",
                      items: {
                        type: "object",
                        properties: {
                          name: { type: "string" },
                          status: { type: "string", enum: ["Handled", "Partially handled", "Unresolved"] },
                          explanation: { type: "string" }
                        },
                        required: ["name", "status", "explanation"],
                        additionalProperties: false
                      }
                    }
                  },
                  required: [
                    "id",
                    "directionId",
                    "name",
                    "description",
                    "targetOccasion",
                    "ingredients",
                    "prepMethod",
                    "chefNotes",
                    "watchouts",
                    "manufacturingNotes",
                    "validationPlan",
                    "constraintChecklist"
                  ],
                  additionalProperties: false
                }
              },
              pitchPackage: {
                type: "object",
                properties: {
                  executiveSummary: { type: "string" },
                  gammaPrompt: { type: "string" }
                },
                required: ["executiveSummary", "gammaPrompt"],
                additionalProperties: false
              },
              imagePrompts: {
                type: "array",
                items: { type: "string" }
              }
            },
            required: ["operationalStrategy", "interpretation", "marketSignals", "directions", "recipes", "pitchPackage", "imagePrompts"],
            additionalProperties: false
          }
        }
      }
    }, { signal: controller.signal });

    clearTimeout(timeoutId);

    const resultText = response.choices[0]?.message?.content;
    if (!resultText) {
      throw new Error(errorCopy.emptyResponse);
    }

    const data = JSON.parse(resultText);
    return NextResponse.json(data);

  } catch (error: unknown) {
    console.error("Generate error:", error);
    const errorCopy = getErrorCopy(locale);
    if (error instanceof Error && error.name === "AbortError") {
      return NextResponse.json({ error: errorCopy.timedOut }, { status: 504 });
    }
    const details = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: errorCopy.failed, details }, { status: 500 });
  }
}
