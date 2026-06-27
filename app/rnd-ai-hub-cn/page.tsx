import type { Metadata } from "next";
import { BriefToPitchDemoApp } from "@/components/brief-to-pitch/demo-app";

export const metadata: Metadata = {
  title: "Fresh Food Brief-to-Pitch Copilot Demo | 中文",
  description: "把客户新品 Brief 变成可提案的研发方案。",
};

export default function RndAiHubChinesePage() {
  return <BriefToPitchDemoApp locale="cn" />;
}
