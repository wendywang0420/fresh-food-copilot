import React from "react";
import type { BriefToPitchCopy, DemoLocale } from "@/lib/brief-to-pitch/copy";

export function BriefInputPanel({ 
  locale,
  copy,
  brief,
  onBriefChange,
  onGenerate 
}: { 
  locale: DemoLocale;
  copy: BriefToPitchCopy;
  brief: string;
  onBriefChange: (val: string) => void;
  onGenerate: (brief: string, context: unknown) => void;
}) {
  const activeSample = copy.input.samples.find((sample) => !sample.disabled) ?? copy.input.samples[0];

  return (
    <section id="demo-app" className="w-full max-w-[1180px] mx-auto px-[20px] py-[40px]">
      <div className="bg-white border border-[rgba(23,58,66,0.12)] rounded-[28px] p-[32px] shadow-[0_14px_40px_rgba(17,67,74,0.08)]">
        <h2 className="text-[24px] font-bold text-[#173a42] mb-[16px] tracking-[-0.03em]">{copy.input.heading}</h2>
        <p className="text-[14px] text-[#6f8183] mb-[24px]">
          {copy.input.intro}
          <strong className="text-[#087f74] ml-2">{copy.input.privacyNotice}</strong>
        </p>

        <textarea
          className="w-full min-h-[160px] p-[16px] border border-[rgba(23,58,66,0.14)] rounded-[16px] bg-[#fbfdf9] text-[#173a42] placeholder:text-[#6f8183] focus:outline-none focus:border-[#22b8a5] focus:ring-4 focus:ring-[rgba(34,184,165,0.1)] resize-y mb-[24px]"
          placeholder={copy.input.placeholder}
          value={brief}
          onChange={(e) => onBriefChange(e.target.value)}
        />

        <div className="flex flex-wrap items-center justify-between gap-[16px]">
          <div className="flex items-center gap-[12px]">
            <span className="text-[14px] text-[#6f8183]">{copy.input.sampleLabel}</span>
            {copy.input.samples.map((sample) => (
              <button
                key={`${locale}-${sample.label}`}
                onClick={() => {
                  if (sample.disabled) return;
                  onBriefChange(sample.text);
                }}
                disabled={sample.disabled}
                title={sample.disabled ? "Coming soon" : undefined}
                className={`border rounded-full px-[14px] py-[8px] text-[13px] font-[700] transition-all ${
                  sample.disabled
                    ? "border-[rgba(8,127,116,0.18)] bg-[rgba(247,251,248,0.5)] text-[#6f8183] cursor-not-allowed opacity-60"
                    : "border-[rgba(8,127,116,0.18)] bg-[rgba(247,251,248,0.9)] text-[#087f74] hover:-translate-y-[2px] hover:bg-[#dff8f3]"
                }`}
              >
                {sample.label}
              </button>
            ))}
          </div>

          <button
            onClick={() => onGenerate(brief, activeSample.context)}
            disabled={!brief.trim()}
            className="border-0 rounded-full py-[12px] px-[24px] cursor-pointer font-[800] bg-gradient-to-br from-[#087f74] to-[#22b8a5] text-white shadow-[0_12px_24px_rgba(34,184,165,0.22)] transition-all hover:-translate-y-[2px] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {copy.input.generateCta}
          </button>
        </div>
      </div>
    </section>
  );
}
