import type { HarnessKind } from "../shared/harnesses";
import { isClaudeCode } from "./isClaudeCode";
import { isCodex } from "./isCodex";

let declaredByHookEntryPoint: HarnessKind | undefined;

export function markActiveHarness(harness: HarnessKind | undefined): void {
	declaredByHookEntryPoint = harness;
}

export function activeHarness(): HarnessKind | undefined {
	if (declaredByHookEntryPoint) return declaredByHookEntryPoint;
	if (isClaudeCode()) return "claude";
	if (isCodex()) return "codex";
	return undefined;
}
