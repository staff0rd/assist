import type { HarnessKind } from "../../shared/harnesses";
import { loadConfig } from "../../shared/loadConfig";

export const DEFAULT_SYNTHESIS_HARNESS: HarnessKind = "claude";

export function resolveSynthesisHarness(): HarnessKind {
	return loadConfig().review?.synthesisHarness ?? DEFAULT_SYNTHESIS_HARNESS;
}
