"use client";

import Link from "next/link";
import type { DemoLocale } from "@/lib/brief-to-pitch/copy";

const ROUTES: Record<DemoLocale, string> = {
  en: "/rnd-ai-hub-en",
  cn: "/rnd-ai-hub-cn",
};

export function LanguageToggle({ locale }: { locale: DemoLocale }) {
  const isEnglish = locale === "en";

  return (
    <div
      className="inline-flex items-center gap-[8px] rounded-full border border-[rgba(23,58,66,0.08)] bg-[rgba(255,255,255,0.72)] px-[12px] py-[8px] text-[13px] font-[750] shadow-[0_10px_30px_rgba(17,67,74,0.05)]"
      aria-label={isEnglish ? "Language switcher" : "语言切换"}
    >
      <Link
        href={ROUTES.cn}
        className={isEnglish ? "text-[#6f8183] hover:text-[#087f74]" : "text-[#087f74]"}
        aria-current={isEnglish ? undefined : "page"}
      >
        CN
      </Link>
      <span className="text-[#9bb0b2]">|</span>
      <Link
        href={ROUTES.en}
        className={isEnglish ? "text-[#087f74]" : "text-[#6f8183] hover:text-[#087f74]"}
        aria-current={isEnglish ? "page" : undefined}
      >
        EN
      </Link>
    </div>
  );
}
