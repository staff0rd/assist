import { hunksOf } from "./hunksOf";

export function hunkTextsOf(patch: string | undefined): string[] {
	return hunksOf(patch ?? "").filter((text) => text.startsWith("@@"));
}
