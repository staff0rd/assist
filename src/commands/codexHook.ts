import { readStdin } from "../lib/readStdin";
import { adviceHookPayload } from "./advise/adviceHookPayload";
import { decideCommand } from "./cliHook/decideCommand";
import type { HookDecision } from "./cliHook/resolvePermission";
import {
	type ParsedInput,
	parseCodexHookInput,
} from "./codexHook/parseCodexHookInput";
import { relayCodexUsage } from "./codexHook/relayCodexUsage";
import { reportCodexStatus } from "./codexHook/reportCodexStatus";

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

function decide(input: ParsedInput): HookDecision | undefined {
	if (!input.toolName || !input.command) return undefined;
	return decideCommand(input.toolName, input.command);
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
	const input = parseCodexHookInput(await readStdin());
	if (!input) return;

	const decision = decide(input);
	const output = outputFor(input, decision);
	if (output) console.log(JSON.stringify(output));

	await reportCodexStatus(input.event, decision !== undefined);
	await relayCodexUsage(input.event, input.transcriptPath);
}
