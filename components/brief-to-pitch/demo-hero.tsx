export function DemoHero() {
  return (
    <header className="relative w-full max-w-[1180px] mx-auto px-[20px] pt-[86px] pb-[74px] grid grid-cols-1 md:grid-cols-[1.02fr_0.98fr] gap-[48px] items-center">
      <div className="z-10">
        <div className="inline-flex items-center gap-[9px] px-[12px] py-[8px] border border-[rgba(8,127,116,0.17)] rounded-full bg-[rgba(255,255,255,0.7)] text-[#087f74] font-[760] text-[13px] tracking-[0.04em] shadow-[0_10px_26px_rgba(17,67,74,0.05)]">
          <span className="w-[8px] h-[8px] bg-[#22b8a5] rounded-full shadow-[0_0_0_7px_rgba(34,184,165,0.13)]"></span>
          Fresh Food Brief-to-Pitch Copilot
        </div>

        <h1 className="mt-[24px] mb-[20px] text-[clamp(42px,7vw,82px)] leading-[0.98] tracking-[-0.07em] max-w-[730px] font-bold text-[#173a42]">
          Turn customer menu briefs into{" "}
          <span className="inline-block relative text-[#087f74]">
            pitch-ready
            <span className="absolute left-[1%] right-[2%] bottom-[2px] h-[12px] rounded-full bg-[rgba(34,184,165,0.18)] -z-10 -rotate-1"></span>
          </span>{" "}
          food concepts.
        </h1>

        <p className="text-[18px] leading-[1.85] text-[#2f5960] max-w-[620px] m-0">
          Analyze the brief, identify market and cuisine signals, generate R&D directions, create recipe concepts, and prepare Gamma-ready proposal content.
        </p>

        <div className="flex items-center gap-[14px] flex-wrap mt-[32px]">
          <button
            className="border-0 rounded-full py-[15px] px-[22px] cursor-pointer font-[800] inline-flex items-center justify-center gap-[10px] bg-gradient-to-br from-[#087f74] to-[#22b8a5] text-white shadow-[0_18px_34px_rgba(34,184,165,0.28)] transition-all hover:-translate-y-[3px] hover:shadow-[0_26px_44px_rgba(34,184,165,0.34)]"
            onClick={() => {
              const el = document.getElementById("demo-app");
              if (el) el.scrollIntoView({ behavior: "smooth" });
            }}
          >
            Try the demo
            <span aria-hidden="true">→</span>
          </button>

          <button
            className="border border-[rgba(23,58,66,0.12)] rounded-full py-[15px] px-[22px] cursor-pointer font-[800] inline-flex items-center justify-center gap-[10px] bg-[rgba(255,255,255,0.72)] text-[#173a42] shadow-[0_12px_30px_rgba(17,67,74,0.05)] transition-all hover:-translate-y-[3px] hover:bg-white hover:border-[rgba(34,184,165,0.28)]"
            onClick={() => {
              const el = document.getElementById("sample-flow");
              if (el) el.scrollIntoView({ behavior: "smooth" });
            }}
          >
            View sample proposal flow
          </button>
        </div>

        <div className="flex flex-wrap gap-[10px] mt-[28px]" aria-label="Key features">
          <span className="px-[12px] py-[9px] bg-[rgba(255,255,255,0.64)] border border-[rgba(23,58,66,0.12)] rounded-full text-[#6f8183] text-[13px]">
            <strong className="text-[#173a42]">International</strong>-first
          </span>
          <span className="px-[12px] py-[9px] bg-[rgba(255,255,255,0.64)] border border-[rgba(23,58,66,0.12)] rounded-full text-[#6f8183] text-[13px]">
            <strong className="text-[#173a42]">Specific</strong> & actionable
          </span>
          <span className="px-[12px] py-[9px] bg-[rgba(255,255,255,0.64)] border border-[rgba(23,58,66,0.12)] rounded-full text-[#6f8183] text-[13px]">
            <strong className="text-[#173a42]">Operationally</strong> realistic
          </span>
        </div>
      </div>

      <aside
        className="relative bg-gradient-to-b from-[rgba(255,255,255,0.94)] to-[rgba(255,255,255,0.78)] border border-[rgba(23,58,66,0.12)] rounded-[36px] shadow-[0_24px_70px_rgba(17,67,74,0.12)] p-[20px] overflow-hidden"
        aria-label="Workflow Demo preview"
      >
        {/* Radial gradient background simulation */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_5%,rgba(34,184,165,0.14),transparent_32%)] pointer-events-none -z-10" />
        <div className="absolute inset-[12px] border border-dashed border-[rgba(8,127,116,0.16)] rounded-[28px] pointer-events-none z-0" />

        <div className="relative z-10 flex items-center justify-between gap-[12px] p-[6px_6px_18px]">
          <div className="flex items-center gap-[12px]">
            <div className="w-[45px] h-[45px] rounded-[17px] bg-[radial-gradient(circle_at_68%_25%,#ffffff_0_9%,transparent_10%),linear-gradient(135deg,#aee8e0,#20b6a5)] shadow-[0_12px_24px_rgba(34,184,165,0.22)]" aria-hidden="true" />
            <div>
              <h2 className="m-0 text-[16px] tracking-[-0.02em] font-bold text-[#173a42]">Brief-to-Pitch Workflow</h2>
              <p className="m-0 mt-[4px] text-[12px] text-[#6f8183]">Fast, specific, actionable</p>
            </div>
          </div>
          <div className="inline-flex items-center gap-[7px] px-[11px] py-[8px] rounded-full bg-[rgba(223,248,243,0.86)] text-[#087f74] text-[12px] font-[800]">
            <span className="w-[7px] h-[7px] rounded-full bg-[#22b8a5] animate-pulse" />
            Ready
          </div>
        </div>

        <div className="relative z-10 bg-[rgba(248,253,250,0.9)] border border-[rgba(23,58,66,0.1)] rounded-[26px] p-[16px] min-h-[360px] flex flex-col gap-[14px]">
          <div className="max-w-[88%] p-[14px_15px] rounded-[18px] leading-[1.65] text-[14px] self-start bg-white border border-[rgba(23,58,66,0.1)] shadow-[0_10px_26px_rgba(17,67,74,0.06)] rounded-tl-[8px] text-[#173a42]">
            Welcome to the Fresh Food Copilot. Paste your customer brief to generate R&D directions and Gamma-ready pitches.
          </div>

          <div className="max-w-[88%] p-[14px_15px] rounded-[18px] leading-[1.65] text-[14px] self-end bg-gradient-to-br from-[#1b9f91] to-[#22b8a5] text-white rounded-tr-[8px] shadow-[0_12px_28px_rgba(34,184,165,0.22)]">
            We are looking for a new savory food item to add to our summer seasonal menu...
          </div>

          <div className="max-w-[88%] p-[14px_15px] rounded-[18px] leading-[1.65] text-[14px] self-start bg-white border border-[rgba(23,58,66,0.1)] shadow-[0_10px_26px_rgba(17,67,74,0.06)] rounded-tl-[8px] text-[#173a42]">
            <strong className="text-[#087f74]">Direction 1:</strong> Mediterranean Lemon-Herb Chicken Focaccia
            <br />
            <strong className="text-[#087f74]">Why it fits:</strong> Pairs excellently with cold brews; feels premium but is a single-step heat.
          </div>

          <div className="flex flex-wrap gap-[9px] mt-auto">
            <button className="border border-[rgba(8,127,116,0.14)] bg-[rgba(255,255,255,0.82)] text-[#2f5960] rounded-full px-[11px] py-[8px] text-[12px] transition-all hover:-translate-y-[2px] hover:border-[rgba(34,184,165,0.4)] hover:bg-white">
              Starbucks Summer Menu
            </button>
            <button className="border border-[rgba(8,127,116,0.14)] bg-[rgba(255,255,255,0.82)] text-[#2f5960] rounded-full px-[11px] py-[8px] text-[12px] transition-all hover:-translate-y-[2px] hover:border-[rgba(34,184,165,0.4)] hover:bg-white">
              Yum China Lunch
            </button>
          </div>
        </div>
      </aside>
    </header>
  );
}
