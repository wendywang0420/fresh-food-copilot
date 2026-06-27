import React from "react";
import { STARBUCKS_MOCK_DATA } from "./mock-data";
import type {
  BriefToPitchDirection,
  BriefToPitchOutput,
  BriefToPitchRecipe,
  ConstraintStatus,
} from "./types";

const statusStyles: Record<ConstraintStatus, string> = {
  Handled: "bg-[rgba(34,184,165,0.12)] text-[#087f74]",
  "Partially handled": "bg-[rgba(255,206,84,0.18)] text-[#7a5b00]",
  Unresolved: "bg-[rgba(255,107,107,0.14)] text-[#a33a3a]",
};

const riskStyles = {
  Low: "bg-[rgba(34,184,165,0.12)] text-[#087f74]",
  Medium: "bg-[rgba(255,206,84,0.18)] text-[#7a5b00]",
  High: "bg-[rgba(255,107,107,0.14)] text-[#a33a3a]",
};

export function OutputPanels({ data, onOpenLeadCapture }: { data?: BriefToPitchOutput, onOpenLeadCapture?: (intent: "email" | "demo") => void }) {
  const { operationalStrategy, interpretation, marketSignals, directions, recipes, pitchPackage } = data || STARBUCKS_MOCK_DATA;

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert("Copied to clipboard!");
  };

  return (
    <section className="w-full max-w-[1180px] mx-auto px-[20px] py-[40px] flex flex-col gap-[32px]">
      <div className="bg-[#fff7d9] text-[#173a42] p-[16px] rounded-[16px] border border-[rgba(23,58,66,0.12)] text-[14px]">
        <strong>Disclaimer:</strong> These outputs are AI-generated concept directions for proposal development. 
        Final recipes, claims, costs, and production feasibility should be validated by chefs, R&D, regulatory, and operations teams.
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-[24px]">
        {/* Brief Interpretation Panel */}
        <div className="bg-white border border-[rgba(23,58,66,0.12)] rounded-[24px] p-[24px] shadow-[0_14px_40px_rgba(17,67,74,0.08)]">
          <h3 className="text-[18px] font-bold text-[#087f74] mb-[16px]">Brief Interpretation</h3>
          <p className="text-[14px] text-[#2f5960] mb-[12px]"><strong>Target Audience:</strong> {interpretation.targetAudience}</p>
          <div className="mb-[12px]">
            <strong className="text-[14px] text-[#2f5960]">Emotional Keywords:</strong>
            <div className="flex flex-wrap gap-[6px] mt-[8px]">
              {interpretation.emotionalKeywords.map((kw: string, i: number) => (
                <span key={i} className="px-[10px] py-[4px] bg-[rgba(34,184,165,0.1)] text-[#087f74] rounded-full text-[12px]">{kw}</span>
              ))}
            </div>
          </div>
          <div className="mb-[12px]">
            <strong className="text-[14px] text-[#2f5960]">Constraints:</strong>
            <ul className="list-disc list-inside mt-[4px] text-[14px] text-[#6f8183]">
              {interpretation.constraints.map((c: string, i: number) => <li key={i}>{c}</li>)}
            </ul>
          </div>
          <div>
            <strong className="text-[14px] text-[#2f5960]">Hidden Requirements:</strong>
            <ul className="list-disc list-inside mt-[4px] text-[14px] text-[#6f8183]">
              {interpretation.hiddenRequirements.map((req: string, i: number) => <li key={i}>{req}</li>)}
            </ul>
          </div>
        </div>

        {/* Market Signals Panel */}
        <div className="bg-white border border-[rgba(23,58,66,0.12)] rounded-[24px] p-[24px] shadow-[0_14px_40px_rgba(17,67,74,0.08)]">
          <h3 className="text-[18px] font-bold text-[#087f74] mb-[16px]">Market & Cuisine Signals</h3>
          <div className="mb-[12px]">
            <strong className="text-[14px] text-[#2f5960]">Trend Signals:</strong>
            <ul className="list-disc list-inside mt-[4px] text-[14px] text-[#6f8183]">
              {marketSignals.trendSignals.map((t: string, i: number) => <li key={i}>{t}</li>)}
            </ul>
          </div>
          <div className="mb-[12px]">
            <strong className="text-[14px] text-[#2f5960]">Cuisine Inspiration:</strong>
            <ul className="list-disc list-inside mt-[4px] text-[14px] text-[#6f8183]">
              {marketSignals.cuisineInspiration.map((t: string, i: number) => <li key={i}>{t}</li>)}
            </ul>
          </div>
        </div>
      </div>

      <div className="bg-white border border-[rgba(23,58,66,0.12)] rounded-[24px] p-[24px] shadow-[0_14px_40px_rgba(17,67,74,0.08)]">
        <div className="flex flex-wrap items-center gap-[8px] mb-[14px]">
          <h3 className="text-[18px] font-bold text-[#087f74]">Operational Strategy</h3>
          <span className="rounded-full px-[10px] py-[4px] bg-[rgba(34,184,165,0.1)] text-[#087f74] text-[12px] font-bold">
            Playbook: {operationalStrategy.selectedPlaybook}
          </span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-[20px] text-[14px]">
          <div className="text-[#2f5960]">
            <strong>Key Constraints</strong>
            <ul className="list-disc list-inside mt-[6px] text-[#6f8183]">
              {operationalStrategy.keyConstraints.map((item, i) => <li key={i}>{item}</li>)}
            </ul>
          </div>
          <div className="text-[#2f5960]">
            <strong>Concept Strategy</strong>
            <p className="mt-[6px] text-[#6f8183] leading-[1.6]">{operationalStrategy.conceptStrategy}</p>
          </div>
          <div className="text-[#2f5960]">
            <strong>Allowed Formats</strong>
            <div className="flex flex-wrap gap-[6px] mt-[8px]">
              {operationalStrategy.allowedFormats.map((item, i) => (
                <span key={i} className="px-[10px] py-[4px] bg-[rgba(23,58,66,0.06)] text-[#173a42] rounded-full text-[12px]">
                  {item}
                </span>
              ))}
            </div>
          </div>
          <div className="text-[#2f5960]">
            <strong>Risky Formats</strong>
            <div className="flex flex-wrap gap-[6px] mt-[8px]">
              {operationalStrategy.riskyFormats.map((item, i) => (
                <span key={i} className="px-[10px] py-[4px] bg-[rgba(255,107,107,0.12)] text-[#a33a3a] rounded-full text-[12px]">
                  {item}
                </span>
              ))}
            </div>
          </div>
        </div>
        <div className="mt-[16px]">
          <strong className="text-[14px] text-[#2f5960]">Rejected Ideas</strong>
          <div className="mt-[8px] grid grid-cols-1 md:grid-cols-2 gap-[10px]">
            {operationalStrategy.rejectedIdeas.map((item, i) => (
              <div key={i} className="rounded-[16px] border border-[rgba(23,58,66,0.08)] bg-[#f7fbf8] p-[12px]">
                <div className="font-bold text-[#173a42] text-[13px]">{item.idea}</div>
                <p className="mt-[4px] text-[13px] text-[#6f8183] leading-[1.5]">{item.reason}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* R&D Directions */}
      <div>
        <h3 className="text-[22px] font-bold text-[#173a42] mb-[16px]">R&D Directions</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-[20px]">
          {directions.map((dir: BriefToPitchDirection) => (
            <div key={dir.id} className="bg-gradient-to-b from-[rgba(255,255,255,0.94)] to-[rgba(255,255,255,0.78)] border border-[rgba(23,58,66,0.12)] rounded-[24px] p-[24px] shadow-[0_14px_40px_rgba(17,67,74,0.08)] flex flex-col gap-[12px]">
              <div className="flex flex-wrap items-center gap-[8px]">
                <h4 className="text-[16px] font-bold text-[#173a42] leading-[1.3]">{dir.name}</h4>
                <span className={`rounded-full px-[8px] py-[3px] text-[11px] font-bold ${riskStyles[dir.riskRating]}`}>Risk: {dir.riskRating}</span>
                <span className="rounded-full px-[8px] py-[3px] text-[11px] font-bold bg-[rgba(23,58,66,0.08)] text-[#2f5960]">Confidence: {dir.confidence}</span>
              </div>
              <p className="text-[13px] text-[#6f8183] leading-[1.6]">{dir.conceptLogic}</p>
              <div className="bg-[#f7fbf8] rounded-[16px] p-[12px] flex flex-col gap-[8px]">
                <span className="text-[12px] text-[#2f5960]"><strong>Most Important Constraint Response:</strong> {dir.constraintResponse.howDirectionHandlesConstraints[0]}</span>
                <span className="text-[12px] text-[#2f5960]"><strong>Shelf-Life Strategy:</strong> {dir.operationalFit.shelfLifeStrategy}</span>
                <span className="text-[12px] text-[#2f5960]"><strong>Why It Is Not Generic:</strong> {dir.differentiation.whyThisIsNotGeneric}</span>
              </div>
              <div className="mt-auto flex flex-col gap-[8px] pt-[12px] border-t border-[rgba(23,58,66,0.08)]">
                <span className="text-[12px] text-[#2f5960]"><strong>Flavor:</strong> {dir.flavorProfile}</span>
                <span className="text-[12px] text-[#2f5960]"><strong>Feasibility:</strong> {dir.factoryFeasibility}</span>
                <span className="text-[12px] text-[#2f5960]"><strong>Store Execution:</strong> {dir.operationalFit.storeExecution}</span>
                <span className="text-[12px] text-[#2f5960]"><strong>Heating/Holding:</strong> {dir.operationalFit.heatingOrHoldingMethod}</span>
                <span className="text-[12px] text-[#2f5960]"><strong>Packaging:</strong> {dir.operationalFit.packagingConsiderations}</span>
                <span className="text-[12px] text-[#2f5960]"><strong>Customer Fit:</strong> {dir.differentiation.customerSpecificFit}</span>
                {dir.constraintResponse.unresolvedRisks.length > 0 ? (
                  <div className="text-[12px] text-[#a33a3a]">
                    <strong>Unresolved Risks:</strong>
                    <ul className="list-disc list-inside mt-[4px]">
                      {dir.constraintResponse.unresolvedRisks.map((risk, i) => <li key={i}>{risk}</li>)}
                    </ul>
                  </div>
                ) : null}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recipes */}
      <div>
        <h3 className="text-[22px] font-bold text-[#173a42] mb-[16px]">Recipe Concepts</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-[20px]">
          {recipes.map((rec: BriefToPitchRecipe) => (
            <div key={rec.id} className="bg-white border border-[rgba(23,58,66,0.12)] rounded-[24px] p-[24px] shadow-[0_14px_40px_rgba(17,67,74,0.08)]">
              <h4 className="text-[18px] font-bold text-[#087f74] mb-[8px]">{rec.name}</h4>
              <p className="text-[14px] text-[#6f8183] mb-[16px]">{rec.description}</p>
              
              <strong className="text-[14px] text-[#173a42]">Ingredients:</strong>
              <ul className="list-disc list-inside mt-[4px] mb-[16px] text-[13px] text-[#6f8183]">
                {rec.ingredients.map((ing: string, i: number) => <li key={i}>{ing}</li>)}
              </ul>
              
              <div className="bg-[#f0fbf8] p-[12px] rounded-[12px] text-[13px] text-[#087f74] mb-[12px]">
                <strong>Chef Notes:</strong> {rec.chefNotes}
              </div>

              <div className="grid grid-cols-1 gap-[12px] text-[13px] text-[#2f5960]">
                <div>
                  <strong>Manufacturing Notes:</strong>
                  <ul className="list-disc list-inside mt-[4px] text-[#6f8183]">
                    {rec.manufacturingNotes.makeAheadComponents.map((item, i) => <li key={i}>Make-ahead: {item}</li>)}
                    {rec.manufacturingNotes.moistureMigrationControls.map((item, i) => <li key={`mm-${i}`}>Moisture control: {item}</li>)}
                    {rec.manufacturingNotes.textureProtection.map((item, i) => <li key={`tp-${i}`}>Texture protection: {item}</li>)}
                  </ul>
                  <p className="mt-[6px] text-[#6f8183]"><strong>Service:</strong> {rec.manufacturingNotes.reheatingOrServingInstructions}</p>
                  <p className="mt-[4px] text-[#6f8183]"><strong>Shelf-Life Assumption:</strong> {rec.manufacturingNotes.estimatedShelfLifeAssumption}</p>
                </div>

                <div>
                  <strong>Constraint Checklist:</strong>
                  <div className="mt-[8px] flex flex-col gap-[8px]">
                    {rec.constraintChecklist.map((item, i) => (
                      <div key={i} className="rounded-[14px] border border-[rgba(23,58,66,0.08)] p-[10px]">
                        <div className="flex items-center gap-[8px]">
                          <span className="font-bold text-[#173a42]">{item.name}</span>
                          <span className={`rounded-full px-[8px] py-[2px] text-[11px] font-bold ${statusStyles[item.status]}`}>{item.status}</span>
                        </div>
                        <p className="mt-[4px] text-[#6f8183]">{item.explanation}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <strong>Validation Plan:</strong>
                  <ul className="list-disc list-inside mt-[4px] text-[#6f8183]">
                    {rec.validationPlan.chefValidation.map((item, i) => <li key={`chef-${i}`}>Chef: {item}</li>)}
                    {rec.validationPlan.opsValidation.map((item, i) => <li key={`ops-${i}`}>Ops: {item}</li>)}
                    {rec.validationPlan.sensoryValidation.map((item, i) => <li key={`sensory-${i}`}>Sensory: {item}</li>)}
                    {rec.validationPlan.regulatoryOrClaimsValidation.map((item, i) => <li key={`reg-${i}`}>Regulatory/claims: {item}</li>)}
                  </ul>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Pitch Package */}
      <div className="bg-[#173a42] text-white rounded-[24px] p-[32px] shadow-[0_24px_70px_rgba(17,67,74,0.12)] relative overflow-hidden">
        <div className="relative z-10">
          <h3 className="text-[22px] font-bold mb-[16px]">Pitch Package (Gamma-ready)</h3>
          <p className="text-[15px] text-[rgba(255,255,255,0.8)] mb-[24px] leading-[1.6]">
            {pitchPackage.executiveSummary}
          </p>
          <div className="bg-[rgba(0,0,0,0.2)] p-[16px] rounded-[16px] mb-[24px]">
            <code className="text-[13px] text-[rgba(255,255,255,0.9)] whitespace-pre-wrap font-mono">
              {pitchPackage.gammaPrompt}
            </code>
          </div>
          <button 
            onClick={() => copyToClipboard(pitchPackage.gammaPrompt)}
            className="border border-[rgba(255,255,255,0.2)] bg-[rgba(255,255,255,0.1)] hover:bg-[rgba(255,255,255,0.2)] transition-all rounded-full px-[16px] py-[10px] text-[13px] font-bold"
          >
            Copy Gamma Prompt
          </button>
        </div>
      </div>

      {/* Post-Value CTA */}
      <div className="bg-white border border-[rgba(23,58,66,0.12)] rounded-[24px] p-[32px] shadow-[0_14px_40px_rgba(17,67,74,0.08)] flex flex-col md:flex-row items-center justify-between gap-[24px]">
        <div>
          <h3 className="text-[20px] font-bold text-[#173a42] mb-[8px]">Want to share this proposal?</h3>
          <p className="text-[15px] text-[#6f8183] max-w-[500px]">
            Get the full concept package sent to your email, or talk to us about building a custom workflow for your own R&D team.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-[12px] shrink-0">
          <button 
            onClick={() => onOpenLeadCapture?.("email")}
            className="bg-[#173a42] text-white rounded-full px-[20px] py-[12px] font-bold hover:bg-[#087f74] transition-colors"
          >
            Send to my email
          </button>
          <button 
            onClick={() => onOpenLeadCapture?.("demo")}
            className="border border-[rgba(8,127,116,0.2)] bg-[rgba(255,255,255,0.72)] text-[#087f74] px-[20px] py-[12px] rounded-full font-bold hover:bg-[#dff8f3] transition-colors"
          >
            Request enterprise demo
          </button>
        </div>
      </div>
    </section>
  );
}
