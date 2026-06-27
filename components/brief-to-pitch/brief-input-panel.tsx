import React from "react";
import { STARBUCKS_MOCK_DATA } from "./mock-data";

const SAMPLE_BRIEF = STARBUCKS_MOCK_DATA.brief!;

export function BriefInputPanel({ 
  brief,
  onBriefChange,
  onGenerate 
}: { 
  brief: string;
  onBriefChange: (val: string) => void;
  onGenerate: (brief: string, context: unknown) => void;
}) {
  const handleSampleClick = () => {
    onBriefChange(SAMPLE_BRIEF.text);
  };

  return (
    <section id="demo-app" className="w-full max-w-[1180px] mx-auto px-[20px] py-[40px]">
      <div className="bg-white border border-[rgba(23,58,66,0.12)] rounded-[28px] p-[32px] shadow-[0_14px_40px_rgba(17,67,74,0.08)]">
        <h2 className="text-[24px] font-bold text-[#173a42] mb-[16px] tracking-[-0.03em]">Paste Customer Brief</h2>
        <p className="text-[14px] text-[#6f8183] mb-[24px]">
          Start by pasting a customer menu brief, meeting notes, or seasonal theme. 
          <strong className="text-[#087f74] ml-2">Privacy notice: This is a public demo. Avoid pasting confidential customer briefs.</strong>
        </p>

        <textarea
          className="w-full min-h-[160px] p-[16px] border border-[rgba(23,58,66,0.14)] rounded-[16px] bg-[#fbfdf9] text-[#173a42] placeholder:text-[#6f8183] focus:outline-none focus:border-[#22b8a5] focus:ring-4 focus:ring-[rgba(34,184,165,0.1)] resize-y mb-[24px]"
          placeholder="e.g., We are looking for a new savory food item to add to our summer seasonal menu..."
          value={brief}
          onChange={(e) => onBriefChange(e.target.value)}
        />

        <div className="flex flex-wrap items-center justify-between gap-[16px]">
          <div className="flex items-center gap-[12px]">
            <span className="text-[14px] text-[#6f8183]">Try a sample:</span>
            <button
              onClick={handleSampleClick}
              className="border border-[rgba(8,127,116,0.18)] bg-[rgba(247,251,248,0.9)] text-[#087f74] rounded-full px-[14px] py-[8px] text-[13px] font-[700] transition-all hover:-translate-y-[2px] hover:bg-[#dff8f3]"
            >
              Starbucks Seasonal Menu
            </button>
            <button
              disabled
              title="Coming soon"
              className="border border-[rgba(8,127,116,0.18)] bg-[rgba(247,251,248,0.5)] text-[#6f8183] rounded-full px-[14px] py-[8px] text-[13px] font-[700] cursor-not-allowed opacity-60"
            >
              Yum China Lunch (Coming soon)
            </button>
          </div>

          <button
            onClick={() => onGenerate(brief, SAMPLE_BRIEF.context)}
            disabled={!brief.trim()}
            className="border-0 rounded-full py-[12px] px-[24px] cursor-pointer font-[800] bg-gradient-to-br from-[#087f74] to-[#22b8a5] text-white shadow-[0_12px_24px_rgba(34,184,165,0.22)] transition-all hover:-translate-y-[2px] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Generate Concepts
          </button>
        </div>
      </div>
    </section>
  );
}
