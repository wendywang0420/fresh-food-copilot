import React, { useEffect, useState } from "react";
import type { BriefToPitchCopy } from "@/lib/brief-to-pitch/copy";

export function ProcessingTimeline({
  copy,
  error,
  onFallback,
}: {
  copy: BriefToPitchCopy;
  error?: string | null;
  onFallback?: () => void;
}) {
  const [activeStep, setActiveStep] = useState(0);
  const steps = copy.processing.steps;

  useEffect(() => {
    if (!error && activeStep < steps.length - 1) {
      const timer = setTimeout(() => {
        setActiveStep(s => s + 1);
      }, 1500); // 1.5 seconds per mock step
      return () => clearTimeout(timer);
    }
  }, [activeStep, steps.length, error]);

  return (
    <section className="w-full max-w-[1180px] mx-auto px-[20px] py-[40px]">
      <div className="bg-white border border-[rgba(23,58,66,0.12)] rounded-[28px] p-[32px] shadow-[0_14px_40px_rgba(17,67,74,0.08)]">
        <h3 className="text-[20px] font-bold text-[#173a42] mb-[24px]">{copy.processing.heading}</h3>
        <p className="text-[14px] text-[#6f8183] mb-[24px]">
          {copy.processing.intro}
        </p>
        
        <div className="flex flex-col gap-[16px]">
          {steps.map((step, idx) => {
            const isActive = idx === activeStep;
            const isCompleted = idx < activeStep;
            const isPending = idx > activeStep;
            
            return (
              <div key={idx} className={`flex items-center gap-[16px] transition-opacity duration-300 ${isPending ? 'opacity-40' : 'opacity-100'}`}>
                <div className="relative flex items-center justify-center w-[28px] h-[28px] shrink-0">
                  {isCompleted ? (
                    <div className="w-[20px] h-[20px] rounded-full bg-[#22b8a5] flex items-center justify-center text-white">
                      <svg className="w-[12px] h-[12px]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  ) : isActive ? (
                    error ? (
                      <div className="w-[20px] h-[20px] rounded-full bg-red-500 flex items-center justify-center text-white font-bold text-[12px]">!</div>
                    ) : (
                      <div className="w-[20px] h-[20px] rounded-full border-2 border-[#087f74] border-t-transparent animate-spin" />
                    )
                  ) : (
                    <div className="w-[12px] h-[12px] rounded-full bg-[#dff8f3] border border-[#087f74]" />
                  )}
                  {idx !== steps.length - 1 && (
                    <div className={`absolute top-[28px] left-[13px] w-[2px] h-[16px] ${isCompleted ? 'bg-[#22b8a5]' : 'bg-[#dff8f3]'}`} />
                  )}
                </div>
                <span className={`text-[15px] ${isActive ? (error ? 'text-red-600 font-bold' : 'text-[#087f74] font-bold') : isCompleted ? 'text-[#173a42]' : 'text-[#6f8183]'}`}>
                  {step}
                </span>
              </div>
            );
          })}
        </div>

        {!error && activeStep === steps.length - 1 ? (
          <div className="mt-[24px] rounded-[16px] bg-[#f7fbf8] border border-[rgba(23,58,66,0.08)] px-[16px] py-[14px] text-[14px] text-[#2f5960]">
            {copy.processing.finalMessage}
          </div>
        ) : null}

        {error && (
          <div className="mt-[32px] p-[16px] bg-red-50 border border-red-200 rounded-[16px] flex flex-col sm:flex-row items-center justify-between gap-[16px]">
            <p className="text-red-700 text-[14px] m-0"><strong>{copy.processing.errorPrefix}</strong> {error}</p>
            <button 
              onClick={onFallback}
              className="shrink-0 bg-white border border-red-200 text-red-700 font-bold px-[16px] py-[8px] rounded-full text-[13px] hover:bg-red-50 transition-colors"
            >
              {copy.processing.fallbackCta}
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
