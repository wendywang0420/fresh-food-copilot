"use client";

import React, { useState, useEffect } from "react";
import { DemoHero } from "./demo-hero";
import { BriefInputPanel } from "./brief-input-panel";
import { ProcessingTimeline } from "./processing-timeline";
import { OutputPanels } from "./output-panels";
import { LeadCaptureModal } from "./lead-capture-modal";
import type { BriefToPitchOutput } from "./types";

type AppState = "input" | "processing" | "output";
type DemoContext = unknown;

interface PersistedDemoState {
  appState?: AppState;
  briefText?: string;
  contextFields?: DemoContext;
  generatedData?: BriefToPitchOutput | null;
}

function restorePersistedDemoState(
  parsed: PersistedDemoState,
  setters: {
    setAppState: React.Dispatch<React.SetStateAction<AppState>>;
    setBriefText: React.Dispatch<React.SetStateAction<string>>;
    setContextFields: React.Dispatch<React.SetStateAction<DemoContext | null>>;
    setGeneratedData: React.Dispatch<React.SetStateAction<BriefToPitchOutput | null>>;
  }
) {
  if (parsed.appState) setters.setAppState(parsed.appState);
  if (parsed.briefText) setters.setBriefText(parsed.briefText);
  if (parsed.contextFields) setters.setContextFields(parsed.contextFields);
  if (parsed.generatedData) setters.setGeneratedData(parsed.generatedData);
}

export function BriefToPitchDemoApp() {
  const [isLoaded, setIsLoaded] = useState(false);
  const [appState, setAppState] = useState<AppState>("input");
  const [briefText, setBriefText] = useState("");
  const [contextFields, setContextFields] = useState<DemoContext | null>(null);
  const [generatedData, setGeneratedData] = useState<BriefToPitchOutput | null>(null);
  
  const [leadCaptureIntent, setLeadCaptureIntent] = useState<"email" | "demo" | null>(null);

  // Load state from sessionStorage on mount
  useEffect(() => {
    let frameId = 0;
    try {
      const savedState = sessionStorage.getItem("freshFoodDemoState");
      if (savedState) {
        const parsed = JSON.parse(savedState) as PersistedDemoState;
        restorePersistedDemoState(parsed, {
          setAppState,
          setBriefText,
          setContextFields,
          setGeneratedData,
        });
      }
    } catch (e) {
      console.error("Failed to load state", e);
    }

    frameId = window.requestAnimationFrame(() => {
      setIsLoaded(true);
    });

    return () => {
      window.cancelAnimationFrame(frameId);
    };
  }, []);

  // Save state to sessionStorage when it changes
  useEffect(() => {
    if (!isLoaded) return;
    const stateObj = {
      appState,
      briefText,
      contextFields,
      generatedData
    };
    sessionStorage.setItem("freshFoodDemoState", JSON.stringify(stateObj));
  }, [appState, briefText, contextFields, generatedData, isLoaded]);

  const [apiError, setApiError] = useState<string | null>(null);

  const handleGenerate = async (brief: string, context: DemoContext) => {
    setBriefText(brief);
    setContextFields(context);
    setAppState("processing");
    setApiError(null);

    try {
      const res = await fetch("/api/demo/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ brief, context }),
      });

      if (!res.ok) {
        const errorData = (await res.json()) as { error?: string };
        throw new Error(errorData.error || "Generation failed.");
      }

      const data = (await res.json()) as BriefToPitchOutput;
      setGeneratedData(data);
      setAppState("output");
    } catch (err: unknown) {
      console.error(err);
      setApiError(err instanceof Error ? err.message : "An unexpected error occurred.");
    }
  };

  const handleFallbackToMock = () => {
    setApiError(null);
    setGeneratedData(null); // Passing null to OutputPanels triggers mock data fallback
    setAppState("output");
  };

  const handleStartOver = () => {
    setAppState("input");
    setBriefText("");
    setContextFields(null);
    setGeneratedData(null);
    setApiError(null);
    setLeadCaptureIntent(null);
    sessionStorage.removeItem("freshFoodDemoState");
  };

  if (!isLoaded) return null; // Avoid hydration mismatch

  return (
    <div className="min-h-screen bg-[#f7fbf8] font-sans text-[#173a42]">
      {/* Navigation Bar Mock */}
      <nav className="sticky top-0 z-20 backdrop-blur-xl bg-[rgba(247,251,248,0.76)] border-b border-[rgba(23,58,66,0.08)]">
        <div className="w-full max-w-[1180px] mx-auto h-[74px] flex items-center justify-between px-[20px]">
          <div className="flex items-center gap-[12px] font-[760] tracking-[-0.03em]">
            <div className="w-[40px] h-[40px] rounded-[15px] bg-[radial-gradient(circle_at_62%_22%,#ffffff_0_13%,transparent_14%),linear-gradient(135deg,#1fc7b1,#9bded8)] grid place-items-center shadow-[0_14px_26px_rgba(34,184,165,0.22)]">
            </div>
            <div className="flex flex-col leading-[1.05]">
              <span className="text-[17px]">Fresh Food Copilot</span>
              <span className="text-[11px] text-[#6f8183] font-[650] tracking-[0.12em] uppercase mt-[4px]">Brief-to-Pitch</span>
            </div>
          </div>
          
          <button 
            onClick={() => setLeadCaptureIntent("demo")}
            className="border border-[rgba(8,127,116,0.2)] bg-[rgba(255,255,255,0.72)] text-[#087f74] px-[16px] py-[10px] rounded-full font-bold shadow-[0_10px_30px_rgba(17,67,74,0.06)] hover:bg-white hover:-translate-y-[2px] transition-all"
          >
            Request Demo
          </button>
        </div>
      </nav>

      <main>
        {appState === "input" && (
          <>
            <DemoHero />
            <BriefInputPanel 
              brief={briefText} 
              onBriefChange={setBriefText}
              onGenerate={handleGenerate} 
            />
          </>
        )}

        {appState === "processing" && (
          <ProcessingTimeline error={apiError} onFallback={handleFallbackToMock} />
        )}

        {appState === "output" && (
          <div className="animate-in fade-in duration-500 pb-[100px]">
            <div className="w-full max-w-[1180px] mx-auto px-[20px] pt-[40px] flex justify-between items-end">
              <h2 className="text-[32px] font-bold tracking-[-0.04em] text-[#173a42]">Proposal Package</h2>
              <button 
                onClick={handleStartOver}
                className="text-[#087f74] font-bold hover:underline"
              >
                Start Over
              </button>
            </div>
            <OutputPanels 
              data={generatedData ?? undefined} 
              onOpenLeadCapture={(intent) => setLeadCaptureIntent(intent)} 
            />
          </div>
        )}
      </main>

      {leadCaptureIntent && (
        <LeadCaptureModal intent={leadCaptureIntent} onClose={() => setLeadCaptureIntent(null)} />
      )}
    </div>
  );
}
