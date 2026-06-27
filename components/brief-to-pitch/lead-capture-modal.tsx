import React, { useState } from "react";
import type { BriefToPitchCopy } from "@/lib/brief-to-pitch/copy";

export function LeadCaptureModal({
  copy,
  intent,
  onClose,
}: {
  copy: BriefToPitchCopy;
  intent: "email" | "demo";
  onClose: () => void;
}) {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setSubmitted(true);
      setTimeout(() => onClose(), 2500);
    }
  };

  const title = intent === "email" ? copy.modal.emailTitle : copy.modal.demoTitle;
  const desc = intent === "email" 
    ? copy.modal.emailDescription
    : copy.modal.demoDescription;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-[20px] bg-[rgba(23,58,66,0.4)] backdrop-blur-sm animate-in fade-in">
      <div className="bg-white rounded-[24px] shadow-[0_24px_70px_rgba(17,67,74,0.2)] w-full max-w-[480px] p-[32px] relative animate-in slide-in-from-bottom-4">
        <button 
          onClick={onClose}
          className="absolute top-[20px] right-[20px] w-[32px] h-[32px] flex items-center justify-center rounded-full bg-[rgba(23,58,66,0.05)] hover:bg-[rgba(23,58,66,0.1)] text-[#173a42] transition-colors"
        >
          ✕
        </button>
        
        {!submitted ? (
          <>
            <h3 className="text-[24px] font-bold text-[#173a42] mb-[12px] tracking-[-0.03em]">{title}</h3>
            <p className="text-[15px] text-[#6f8183] mb-[24px] leading-[1.6]">
              {desc}
            </p>
            
            <form onSubmit={handleSubmit} className="flex flex-col gap-[16px]">
              <input 
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={copy.modal.emailPlaceholder}
                className="w-full border border-[rgba(23,58,66,0.14)] rounded-[12px] px-[16px] py-[12px] focus:outline-none focus:border-[#22b8a5] focus:ring-4 focus:ring-[rgba(34,184,165,0.1)] transition-all"
              />
              <button 
                type="submit"
                className="w-full bg-[#173a42] text-white rounded-[12px] py-[14px] font-bold hover:bg-[#087f74] transition-colors"
              >
                {copy.modal.submit}
              </button>
            </form>
          </>
        ) : (
          <div className="text-center py-[20px]">
            <div className="w-[48px] h-[48px] bg-[#22b8a5] text-white rounded-full flex items-center justify-center mx-auto mb-[16px]">
              <svg className="w-[24px] h-[24px]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="text-[20px] font-bold text-[#173a42] mb-[8px]">{copy.modal.successTitle}</h3>
            <p className="text-[15px] text-[#6f8183]">{copy.modal.successDescription}</p>
          </div>
        )}
      </div>
    </div>
  );
}
