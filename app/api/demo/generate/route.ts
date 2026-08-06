import { NextResponse } from "next/server";
import { checkRateLimit } from "@/lib/rate-limit";
import { getMockData } from "@/components/brief-to-pitch/mock-data";

export const maxDuration = 45; // Vercel setting (ignored on Cloudflare, but good practice)

const isLocale = (value: unknown): value is "en" | "cn" =>
  value === "en" || value === "cn";

const getErrorCopy = (locale: "en" | "cn") => ({
  tooManyRequests: locale === "cn" ? "请求过于频繁，请稍后再试。" : "Too many requests. Please wait.",
  requestTooLarge: locale === "cn" ? "请求内容过大。" : "Request too large.",
  briefRequired: locale === "cn" ? "必须填写 Brief。" : "Brief is required.",
  briefTooLong: locale === "cn" ? "Brief 内容过长。" : "Brief is too long.",
  failed: locale === "cn" ? "生成失败。" : "Generation failed.",
});

export async function POST(req: Request) {
  let locale: "en" | "cn" = "en";

  try {
    const contentLength = req.headers.get("content-length");
    if (contentLength && parseInt(contentLength, 10) > 1024 * 10) {
      return NextResponse.json({ error: getErrorCopy(locale).requestTooLarge }, { status: 413 });
    }

    const body = (await req.json()) as Record<string, unknown>;
    locale = isLocale(body.locale) ? body.locale : "en";
    const errorCopy = getErrorCopy(locale);
    const { brief } = body;

    const ip = req.headers.get("x-forwarded-for") || "unknown";
    const rl = checkRateLimit(`demo-generate-${ip}`);
    if (!rl.allowed) {
      return NextResponse.json({ error: errorCopy.tooManyRequests }, { status: 429 });
    }

    if (!brief || typeof brief !== "string" || brief.trim().length === 0) {
      return NextResponse.json({ error: errorCopy.briefRequired }, { status: 400 });
    }

    if (brief.length > 3000) {
      return NextResponse.json({ error: errorCopy.briefTooLong }, { status: 400 });
    }

    const demoData = getMockData(locale);
    return NextResponse.json(demoData);
  } catch (error: unknown) {
    console.error("Demo generate error:", error);
    const errorCopy = getErrorCopy(locale);
    const details = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: errorCopy.failed, details }, { status: 500 });
  }
}
