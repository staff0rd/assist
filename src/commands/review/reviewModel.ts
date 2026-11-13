import type { HarnessKind } from "../../shared/harnesses";
import { loadConfig } from "../../shared/loadConfig";
import { resolveCodexModel } from "../../shared/resolveCodexModel";

export function reviewModel(harness: HarnessKind): string | undefined {
	const models: Partial<Record<HarnessKind, string | undefined>> = {
		codex: resolveCodexModel(loadConfig().review?.codexModel),
	};
	return models[harness];
}
