import type { HarnessKind } from "../../shared/harnesses";
import { loadConfig } from "../../shared/loadConfig";

export function reviewModel(harness: HarnessKind): string | undefined {
	const models: Partial<Record<HarnessKind, string>> = {
		codex: loadConfig().review?.codexModel,
	};
	return models[harness];
}
