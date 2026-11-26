import { resolveHighLevelTestRegrouping } from "./resolveHighLevelTestRegrouping";
import type { HighLevelTestFile, HighLevelTestRegrouping } from "./types";

export function withTestRegrouping(
	regrouping: HighLevelTestRegrouping | undefined,
	tests: HighLevelTestFile[],
	warnings: string[],
): { testRegrouping?: HighLevelTestRegrouping } {
	if (!regrouping) return {};
	return {
		testRegrouping: resolveHighLevelTestRegrouping(regrouping, tests, warnings),
	};
}
