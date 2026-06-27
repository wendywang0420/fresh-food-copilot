import React from "react";
import type { BriefToPitchCopy } from "@/lib/brief-to-pitch/copy";
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

export function OutputPanels({
  copy,
  data,
  onOpenLeadCapture,
}: {
  copy: BriefToPitchCopy;
  data: BriefToPitchOutput;
  onOpenLeadCapture?: (intent: "email" | "demo") => void;
}) {
  const { operationalStrategy, interpretation, marketSignals, directions, recipes, pitchPackage, imagePrompts } = data;

  const localizeRisk = (value: string) => {
    if (copy.locale !== "cn") return value;
    return value === "Low" ? "低" : value === "Medium" ? "中" : value === "High" ? "高" : value;
  };

  const localizeConfidence = (value: string) => {
    if (copy.locale !== "cn") return value;
    return value === "Low" ? "低" : value === "Medium" ? "中" : value === "High" ? "高" : value;
  };

  const localizeConstraintStatus = (value: ConstraintStatus) => {
    if (copy.locale !== "cn") return value;
    return value === "Handled"
      ? "已处理"
      : value === "Partially handled"
        ? "部分处理"
        : "未解决";
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert(copy.output.pitch.copySuccessAlert);
  };

  return (
    <section className="w-full max-w-[1180px] mx-auto px-[20px] py-[40px] flex flex-col gap-[32px]">
      <div className="bg-[#fff7d9] text-[#173a42] p-[16px] rounded-[16px] border border-[rgba(23,58,66,0.12)] text-[14px]">
        <strong>{copy.output.disclaimerLabel}</strong> {copy.output.disclaimerText}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-[24px]">
        <div className="bg-white border border-[rgba(23,58,66,0.12)] rounded-[24px] p-[24px] shadow-[0_14px_40px_rgba(17,67,74,0.08)]">
          <h3 className="text-[18px] font-bold text-[#087f74] mb-[16px]">{copy.output.sections.interpretation}</h3>
          <p className="text-[14px] text-[#2f5960] mb-[12px]">
            <strong>{copy.output.sections.targetAudience}:</strong> {interpretation.targetAudience}
          </p>
          <div className="mb-[12px]">
            <strong className="text-[14px] text-[#2f5960]">{copy.output.sections.emotionalKeywords}:</strong>
            <div className="flex flex-wrap gap-[6px] mt-[8px]">
              {interpretation.emotionalKeywords.map((kw: string, i: number) => (
                <span key={i} className="px-[10px] py-[4px] bg-[rgba(34,184,165,0.1)] text-[#087f74] rounded-full text-[12px]">
                  {kw}
                </span>
              ))}
            </div>
          </div>
          <div className="mb-[12px]">
            <strong className="text-[14px] text-[#2f5960]">{copy.output.sections.constraints}:</strong>
            <ul className="list-disc list-inside mt-[4px] text-[14px] text-[#6f8183]">
              {interpretation.constraints.map((c: string, i: number) => <li key={i}>{c}</li>)}
            </ul>
          </div>
          <div>
            <strong className="text-[14px] text-[#2f5960]">{copy.output.sections.hiddenRequirements}:</strong>
            <ul className="list-disc list-inside mt-[4px] text-[14px] text-[#6f8183]">
              {interpretation.hiddenRequirements.map((req: string, i: number) => <li key={i}>{req}</li>)}
            </ul>
          </div>
        </div>

        <div className="bg-white border border-[rgba(23,58,66,0.12)] rounded-[24px] p-[24px] shadow-[0_14px_40px_rgba(17,67,74,0.08)]">
          <h3 className="text-[18px] font-bold text-[#087f74] mb-[16px]">{copy.output.sections.marketSignals}</h3>
          <div className="mb-[12px]">
            <strong className="text-[14px] text-[#2f5960]">{copy.output.sections.trendSignals}:</strong>
            <ul className="list-disc list-inside mt-[4px] text-[14px] text-[#6f8183]">
              {marketSignals.trendSignals.map((t: string, i: number) => <li key={i}>{t}</li>)}
            </ul>
          </div>
          <div className="mb-[12px]">
            <strong className="text-[14px] text-[#2f5960]">{copy.output.sections.cuisineInspiration}:</strong>
            <ul className="list-disc list-inside mt-[4px] text-[14px] text-[#6f8183]">
              {marketSignals.cuisineInspiration.map((t: string, i: number) => <li key={i}>{t}</li>)}
            </ul>
          </div>
        </div>
      </div>

      <div className="bg-white border border-[rgba(23,58,66,0.12)] rounded-[24px] p-[24px] shadow-[0_14px_40px_rgba(17,67,74,0.08)]">
        <div className="flex flex-wrap items-center gap-[8px] mb-[14px]">
          <h3 className="text-[18px] font-bold text-[#087f74]">{copy.output.sections.operationalStrategy}</h3>
          <span className="rounded-full px-[10px] py-[4px] bg-[rgba(34,184,165,0.1)] text-[#087f74] text-[12px] font-bold">
            {copy.output.sections.playbook}: {operationalStrategy.selectedPlaybook}
          </span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-[20px] text-[14px]">
          <div className="text-[#2f5960]">
            <strong>{copy.output.sections.keyConstraints}</strong>
            <ul className="list-disc list-inside mt-[6px] text-[#6f8183]">
              {operationalStrategy.keyConstraints.map((item, i) => <li key={i}>{item}</li>)}
            </ul>
          </div>
          <div className="text-[#2f5960]">
            <strong>{copy.output.sections.conceptStrategy}</strong>
            <p className="mt-[6px] text-[#6f8183] leading-[1.6]">{operationalStrategy.conceptStrategy}</p>
          </div>
          <div className="text-[#2f5960]">
            <strong>{copy.output.sections.allowedFormats}</strong>
            <div className="flex flex-wrap gap-[6px] mt-[8px]">
              {operationalStrategy.allowedFormats.map((item, i) => (
                <span key={i} className="px-[10px] py-[4px] bg-[rgba(23,58,66,0.06)] text-[#173a42] rounded-full text-[12px]">
                  {item}
                </span>
              ))}
            </div>
          </div>
          <div className="text-[#2f5960]">
            <strong>{copy.output.sections.riskyFormats}</strong>
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
          <strong className="text-[14px] text-[#2f5960]">{copy.output.sections.rejectedIdeas}</strong>
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

      <div>
        <h3 className="text-[22px] font-bold text-[#173a42] mb-[16px]">{copy.output.sections.directions}</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-[20px]">
          {directions.map((dir: BriefToPitchDirection) => (
            <div key={dir.id} className="bg-gradient-to-b from-[rgba(255,255,255,0.94)] to-[rgba(255,255,255,0.78)] border border-[rgba(23,58,66,0.12)] rounded-[24px] p-[24px] shadow-[0_14px_40px_rgba(17,67,74,0.08)] flex flex-col gap-[12px]">
              <div className="flex flex-wrap items-center gap-[8px]">
                <h4 className="text-[16px] font-bold text-[#173a42] leading-[1.3]">{dir.name}</h4>
                <span className={`rounded-full px-[8px] py-[3px] text-[11px] font-bold ${riskStyles[dir.riskRating]}`}>
                  {copy.output.direction.risk}: {localizeRisk(dir.riskRating)}
                </span>
                <span className="rounded-full px-[8px] py-[3px] text-[11px] font-bold bg-[rgba(23,58,66,0.08)] text-[#2f5960]">
                  {copy.output.direction.confidence}: {localizeConfidence(dir.confidence)}
                </span>
              </div>
              <p className="text-[13px] text-[#6f8183] leading-[1.6]">{dir.conceptLogic}</p>
              <div className="bg-[#f7fbf8] rounded-[16px] p-[12px] flex flex-col gap-[8px]">
                <span className="text-[12px] text-[#2f5960]">
                  <strong>{copy.output.direction.mostImportantConstraintResponse}:</strong>{" "}
                  {dir.constraintResponse.howDirectionHandlesConstraints[0]}
                </span>
                <span className="text-[12px] text-[#2f5960]">
                  <strong>{copy.output.direction.shelfLifeStrategy}:</strong> {dir.operationalFit.shelfLifeStrategy}
                </span>
                <span className="text-[12px] text-[#2f5960]">
                  <strong>{copy.output.direction.whyItIsNotGeneric}:</strong> {dir.differentiation.whyThisIsNotGeneric}
                </span>
              </div>
              <div className="mt-auto flex flex-col gap-[8px] pt-[12px] border-t border-[rgba(23,58,66,0.08)]">
                <span className="text-[12px] text-[#2f5960]"><strong>{copy.output.direction.flavor}:</strong> {dir.flavorProfile}</span>
                <span className="text-[12px] text-[#2f5960]"><strong>{copy.output.direction.feasibility}:</strong> {dir.factoryFeasibility}</span>
                <span className="text-[12px] text-[#2f5960]"><strong>{copy.output.direction.storeExecution}:</strong> {dir.operationalFit.storeExecution}</span>
                <span className="text-[12px] text-[#2f5960]"><strong>{copy.output.direction.heatingHolding}:</strong> {dir.operationalFit.heatingOrHoldingMethod}</span>
                <span className="text-[12px] text-[#2f5960]"><strong>{copy.output.direction.packaging}:</strong> {dir.operationalFit.packagingConsiderations}</span>
                <span className="text-[12px] text-[#2f5960]"><strong>{copy.output.direction.customerFit}:</strong> {dir.differentiation.customerSpecificFit}</span>
                {dir.constraintResponse.unresolvedRisks.length > 0 ? (
                  <div className="text-[12px] text-[#a33a3a]">
                    <strong>{copy.output.direction.unresolvedRisks}:</strong>
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

      <div>
        <h3 className="text-[22px] font-bold text-[#173a42] mb-[16px]">{copy.output.sections.recipes}</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-[20px]">
          {recipes.map((rec: BriefToPitchRecipe) => (
            <div key={rec.id} className="bg-white border border-[rgba(23,58,66,0.12)] rounded-[24px] p-[24px] shadow-[0_14px_40px_rgba(17,67,74,0.08)]">
              <h4 className="text-[18px] font-bold text-[#087f74] mb-[8px]">{rec.name}</h4>
              <p className="text-[14px] text-[#6f8183] mb-[16px]">{rec.description}</p>

              <strong className="text-[14px] text-[#173a42]">{copy.output.recipe.ingredients}:</strong>
              <ul className="list-disc list-inside mt-[4px] mb-[16px] text-[13px] text-[#6f8183]">
                {rec.ingredients.map((ing: string, i: number) => <li key={i}>{ing}</li>)}
              </ul>

              <div className="bg-[#f0fbf8] p-[12px] rounded-[12px] text-[13px] text-[#087f74] mb-[12px]">
                <strong>{copy.output.recipe.chefNotes}:</strong> {rec.chefNotes}
              </div>

              <div className="grid grid-cols-1 gap-[12px] text-[13px] text-[#2f5960]">
                <div>
                  <strong>{copy.output.recipe.manufacturingNotes}:</strong>
                  <ul className="list-disc list-inside mt-[4px] text-[#6f8183]">
                    {rec.manufacturingNotes.makeAheadComponents.map((item, i) => (
                      <li key={i}>{copy.output.recipe.makeAheadPrefix}: {item}</li>
                    ))}
                    {rec.manufacturingNotes.moistureMigrationControls.map((item, i) => (
                      <li key={`mm-${i}`}>{copy.output.recipe.moistureControlPrefix}: {item}</li>
                    ))}
                    {rec.manufacturingNotes.textureProtection.map((item, i) => (
                      <li key={`tp-${i}`}>{copy.output.recipe.textureProtectionPrefix}: {item}</li>
                    ))}
                  </ul>
                  <p className="mt-[6px] text-[#6f8183]"><strong>{copy.output.recipe.service}:</strong> {rec.manufacturingNotes.reheatingOrServingInstructions}</p>
                  <p className="mt-[4px] text-[#6f8183]"><strong>{copy.output.recipe.shelfLifeAssumption}:</strong> {rec.manufacturingNotes.estimatedShelfLifeAssumption}</p>
                </div>

                <div>
                  <strong>{copy.output.recipe.constraintChecklist}:</strong>
                  <div className="mt-[8px] flex flex-col gap-[8px]">
                    {rec.constraintChecklist.map((item, i) => (
                      <div key={i} className="rounded-[14px] border border-[rgba(23,58,66,0.08)] p-[10px]">
                        <div className="flex items-center gap-[8px]">
                          <span className="font-bold text-[#173a42]">{item.name}</span>
                          <span className={`rounded-full px-[8px] py-[2px] text-[11px] font-bold ${statusStyles[item.status]}`}>
                            {localizeConstraintStatus(item.status)}
                          </span>
                        </div>
                        <p className="mt-[4px] text-[#6f8183]">{item.explanation}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <strong>{copy.output.recipe.validationPlan}:</strong>
                  <ul className="list-disc list-inside mt-[4px] text-[#6f8183]">
                    {rec.validationPlan.chefValidation.map((item, i) => (
                      <li key={`chef-${i}`}>{copy.output.recipe.chefValidationPrefix}: {item}</li>
                    ))}
                    {rec.validationPlan.opsValidation.map((item, i) => (
                      <li key={`ops-${i}`}>{copy.output.recipe.opsValidationPrefix}: {item}</li>
                    ))}
                    {rec.validationPlan.sensoryValidation.map((item, i) => (
                      <li key={`sensory-${i}`}>{copy.output.recipe.sensoryValidationPrefix}: {item}</li>
                    ))}
                    {rec.validationPlan.regulatoryOrClaimsValidation.map((item, i) => (
                      <li key={`reg-${i}`}>{copy.output.recipe.regulatoryValidationPrefix}: {item}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-[#173a42] text-white rounded-[24px] p-[32px] shadow-[0_24px_70px_rgba(17,67,74,0.12)] relative overflow-hidden">
        <div className="relative z-10">
          <h3 className="text-[22px] font-bold mb-[16px]">{copy.output.sections.pitchPackage}</h3>
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
            {copy.output.pitch.copyGammaPrompt}
          </button>
        </div>
      </div>

      <div className="bg-white border border-[rgba(23,58,66,0.12)] rounded-[24px] p-[24px] shadow-[0_14px_40px_rgba(17,67,74,0.08)]">
        <h3 className="text-[18px] font-bold text-[#087f74] mb-[14px]">{copy.output.sections.imagePrompts}</h3>
        <ul className="list-disc list-inside text-[14px] text-[#6f8183] flex flex-col gap-[8px]">
          {imagePrompts.map((prompt, i) => <li key={i}>{prompt}</li>)}
        </ul>
      </div>

      <div className="bg-white border border-[rgba(23,58,66,0.12)] rounded-[24px] p-[32px] shadow-[0_14px_40px_rgba(17,67,74,0.08)] flex flex-col md:flex-row items-center justify-between gap-[24px]">
        <div>
          <h3 className="text-[20px] font-bold text-[#173a42] mb-[8px]">{copy.output.leadCapture.heading}</h3>
          <p className="text-[15px] text-[#6f8183] max-w-[500px]">
            {copy.output.leadCapture.description}
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-[12px] shrink-0">
          <button
            onClick={() => onOpenLeadCapture?.("email")}
            className="bg-[#173a42] text-white rounded-full px-[20px] py-[12px] font-bold hover:bg-[#087f74] transition-colors"
          >
            {copy.output.leadCapture.sendToEmail}
          </button>
          <button
            onClick={() => onOpenLeadCapture?.("demo")}
            className="border border-[rgba(8,127,116,0.2)] bg-[rgba(255,255,255,0.72)] text-[#087f74] px-[20px] py-[12px] rounded-full font-bold hover:bg-[#dff8f3] transition-colors"
          >
            {copy.output.leadCapture.requestEnterpriseDemo}
          </button>
        </div>
      </div>
    </section>
  );
}
