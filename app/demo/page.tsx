import type { Metadata } from "next";
import { BriefToPitchDemoApp } from "@/components/brief-to-pitch/demo-app";

export const metadata: Metadata = {
  title: "Fresh Food Brief-to-Pitch Copilot Demo",
  description: "Turn customer menu briefs into pitch-ready food concepts.",
};

export default function DemoPage() {
  return <BriefToPitchDemoApp />;
}
