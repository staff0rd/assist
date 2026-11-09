import { type HarnessKind, harnesses } from "../shared/harnesses";
import { isClaudeCode } from "./isClaudeCode";
import { isCodex } from "./isCodex";

let declaredByHookEntryPoint: HarnessKind | undefined;

export function markActiveHarness(harness: HarnessKind | undefined): void {
	declaredByHookEntryPoint = harness;
}

function declaredByLaunch(): HarnessKind | undefined {
	const declared = process.env.ASSIST_HARNESS;
	return declared && Object.hasOwn(harnesses, declared)
		? (declared as HarnessKind)
		: undefined;
}

export function activeHarness(): HarnessKind | undefined {
	if (declaredByHookEntryPoint) return declaredByHookEntryPoint;
	if (isClaudeCode()) return "claude";
	if (isCodex()) return "codex";
	return declaredByLaunch();
}
