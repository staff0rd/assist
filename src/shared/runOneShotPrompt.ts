import { isCodex } from "../lib/isCodex";
import { formatUnavailable } from "./harnessAdapters/formatUnavailable";
import { harnessAdapter } from "./harnessAdapters/harnessAdapter";
import { resolveFeature } from "./harnessAdapters/resolveFeature";
import type { HarnessFeature, OneShotOptions } from "./harnessAdapters/types";
import type { HarnessKind } from "./harnesses";
import { loadConfig } from "./loadConfig";

export class OneShotUnavailableError extends Error {
	constructor(message: string) {
		super(message);
		this.name = "OneShotUnavailableError";
	}
}

export function resolveOneShotHarness(preferred?: HarnessKind): HarnessKind {
	return preferred ?? (isCodex() ? "codex" : loadConfig().harness.engine);
}

export async function runOneShotPrompt(
	prompt: string,
	feature: HarnessFeature,
	options: {
		harness?: HarnessKind;
		timeout?: number;
		effort?: OneShotOptions["effort"];
		cwd?: string;
	} = {},
): Promise<string> {
	const adapter = harnessAdapter(resolveOneShotHarness(options.harness));
	const resolution = resolveFeature(feature, adapter);
	if (!resolution.available)
		throw new OneShotUnavailableError(
			formatUnavailable(feature.label, adapter.label, resolution.reasons),
		);
	return adapter.oneShot(prompt, {
		timeout: options.timeout ?? 30_000,
		...(options.effort ? { effort: options.effort } : {}),
		...(options.cwd ? { cwd: options.cwd } : {}),
	});
}
