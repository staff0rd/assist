import { markActiveHarness } from "../lib/activeHarness";
import { readStdin } from "../lib/readStdin";
import { currentExecutionIdentity } from "../shared/currentExecutionIdentity";
import { codexAdapter } from "../shared/harnessAdapters/codexAdapter";
import { adviceHookPayload } from "./advise/adviceHookPayload";
import type { HookDecision } from "./cliHook/resolvePermission";
import {
	type ParsedInput,
	parseCodexHookInput,
} from "./codexHook/parseCodexHookInput";
import { relayCodexUsage } from "./codexHook/relayCodexUsage";
import { reportCodexStatus } from "./codexHook/reportCodexStatus";
import { decideToolOperations } from "./toolPolicy/decideToolOperations";
import { logPolicyDeny } from "./toolPolicy/logPolicyDeny";

const TOOL_EVENTS = new Set(["PreToolUse", "PermissionRequest"]);

function preToolUseOutput(decision: HookDecision) {
	if (decision.permissionDecision === "allow") return undefined;
	return {
		hookSpecificOutput: {
			hookEventName: "PreToolUse",
			permissionDecision: "deny",
			permissionDecisionReason: decision.permissionDecisionReason,
		},
	};
}

function permissionRequestOutput(decision: HookDecision) {
	return {
		hookSpecificOutput: {
			hookEventName: "PermissionRequest",
			decision: {
				behavior: decision.permissionDecision === "allow" ? "allow" : "deny",
				message: decision.permissionDecisionReason,
			},
		},
	};
}

function outputFor(input: ParsedInput, decision: HookDecision | undefined) {
	if (input.event === "SessionStart")
		return adviceHookPayload(input.cwd ?? process.cwd());
	if (!decision) return undefined;
	if (input.event === "PermissionRequest")
		return permissionRequestOutput(decision);
	return preToolUseOutput(decision);
}

export async function codexHook(): Promise<void> {
	markActiveHarness("codex");
	const input = parseCodexHookInput(await readStdin());
	if (!input) return;

	const operations =
		input.toolCall && TOOL_EVENTS.has(input.event)
			? codexAdapter.toolOperations(input.toolCall)
			: [];
	const identity = currentExecutionIdentity(input.sessionId);
	const decision = await decideToolOperations(operations, identity);
	const output = outputFor(input, decision);
	if (output) console.log(JSON.stringify(output));
	logPolicyDeny(operations, decision, identity, input.cwd);

	await reportCodexStatus(input.event, decision !== undefined);
	await relayCodexUsage(input.event, input.transcriptPath);
}
