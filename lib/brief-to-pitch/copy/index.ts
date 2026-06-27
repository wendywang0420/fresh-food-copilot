export { enCopy } from "./en";
export { cnCopy } from "./cn";
export type { BriefToPitchCopy, DemoLocale, SampleBriefSpec } from "./types";

import { cnCopy } from "./cn";
import { enCopy } from "./en";
import type { BriefToPitchCopy, DemoLocale } from "./types";

export function getBriefToPitchCopy(locale: DemoLocale): BriefToPitchCopy {
  return locale === "cn" ? cnCopy : enCopy;
}
