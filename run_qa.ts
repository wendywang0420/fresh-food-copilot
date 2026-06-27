import fs from "fs";

const briefs = [
  {
    name: "Starbucks seasonal café lunch menu",
    brief: "We are looking for a new savory food item to add to our summer seasonal menu. It should be light, fresh, but satisfying enough for a quick lunch. Must pair well with our iced teas and cold brews. We want something that feels 'premium' but is easy to execute in our stores (we only have warming ovens, no full kitchen). Target price point is $7-$9.",
    context: { customerType: "Café Chain", region: "North America", constraints: "Store warming only, no assembly" }
  },
  {
    name: "Pizza Hut premium side dish launch",
    brief: "Need a new premium side dish to launch alongside our new artisanal pizza range. It needs to be shareable, hold its heat during a 30-minute delivery window, and utilize our existing conveyor pizza ovens. We want to avoid standard garlic bread—looking for something elevated.",
    context: { customerType: "QSR Pizza", region: "Global", constraints: "Conveyor oven only, must survive 30m delivery" }
  },
  {
    name: "Convenience retail summer salad range",
    brief: "Developing a new range of summer salads for our convenience store grab-and-go coolers. They must have a 4-day shelf life, remain visually vibrant, and appeal to health-conscious commuters. Price point $5-$6.",
    context: { customerType: "Convenience Store", region: "UK/Europe", constraints: "4-day shelf life, cold chain only, no heating" }
  },
  {
    name: "European grab-and-go sandwich range",
    brief: "Looking for an innovative grab-and-go sandwich concept for busy European train stations. Needs to be eaten with one hand, resist getting soggy over a 48-hour shelf life, and appeal to a premium, on-the-move demographic.",
    context: { customerType: "Travel Retail", region: "Europe", constraints: "48h shelf life, eaten cold or ambient, 1-handed eating" }
  },
  {
    name: "Middle East café bakery concept",
    brief: "We want a new bakery item for our cafes across Dubai and Riyadh. It should merge traditional Middle Eastern flavor profiles with modern French pastry techniques. Must look stunning in a pastry case and hold up in high ambient humidity.",
    context: { customerType: "Premium Café", region: "Middle East", constraints: "High humidity tolerance, visual appeal in display case" }
  },
  {
    name: "Yum China localized rice bowl/lunch set",
    brief: "Need a localized rice bowl concept for lunch. Should feature a high-protein main, a vibrant vegetable side, and a proprietary sauce. Needs to be assembled in under 60 seconds at the store using precooked, microwavable or boil-in-bag components.",
    context: { customerType: "QSR", region: "China", constraints: "60-second assembly, boil-in-bag/microwave components" }
  },
  {
    name: "Airline catering light meal refresh",
    brief: "Refreshing our economy class light meal for medium-haul flights (3-5 hours). It must be easy to heat in standard galley convection ovens, retain moisture at altitude, and avoid common allergens (nuts/shellfish).",
    context: { customerType: "Airline Catering", region: "Global", constraints: "Galley oven heating, moisture retention at altitude, nut/shellfish free" }
  },
  {
    name: "Supermarket chilled ready-meal innovation",
    brief: "Creating a new chilled ready-meal for premium supermarkets. Focus is on 'restaurant quality at home'. Needs a 7-day shelf life and should be fully microwavable by the end consumer in under 4 minutes. Looking for globally inspired comfort food.",
    context: { customerType: "Supermarket/Grocery", region: "North America", constraints: "7-day shelf life, microwaveable in 4 mins" }
  }
];

async function run() {
  const results = [];
  for (const b of briefs) {
    console.log(`Testing: ${b.name}...`);
    const startedAt = Date.now();
    try {
      const res = await fetch("http://localhost:3000/api/demo/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ brief: b.brief, context: b.context })
      });
      const latencyMs = Date.now() - startedAt;
      if (!res.ok) {
        console.error(`Failed ${b.name}: ${res.status} ${await res.text()}`);
        results.push({ name: b.name, brief: b.brief, success: false, latencyMs, error: `HTTP ${res.status}` });
        continue;
      }
      const data = await res.json();
      results.push({ name: b.name, brief: b.brief, success: true, latencyMs, data });
      console.log(`Success: ${b.name}`);
    } catch (err) {
      const latencyMs = Date.now() - startedAt;
      console.error(`Error on ${b.name}:`, err);
      results.push({
        name: b.name,
        brief: b.brief,
        success: false,
        latencyMs,
        error: err instanceof Error ? err.message : String(err)
      });
    }
  }

  fs.writeFileSync("qa_results.json", JSON.stringify(results, null, 2));
  console.log("Done. Saved to qa_results.json");
}

run();
