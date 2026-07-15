import { readStdin } from "../../lib/readStdin";
import { decideCommand } from "../cliHook/decideCommand";
import type { HookDecision } from "../cliHook/resolvePermission";

type CodexHookInput = {
	hook_event_name?: string;
	tool_name?: string;
	tool_input?: { command?: unknown };
};

const SUPPORTED_TOOLS = new Set(["Bash", "PowerShell"]);

type ParsedInput = { event: string; toolName: string; command: string };

function parseInput(raw: string): ParsedInput | undefined {
	try {
		const data: CodexHookInput = JSON.parse(raw);
		const command = data.tool_input?.command;
		if (typeof command !== "string" || !command.trim()) return undefined;
		if (!data.tool_name || !SUPPORTED_TOOLS.has(data.tool_name))
			return undefined;
		return {
			event: data.hook_event_name ?? "PreToolUse",
			toolName: data.tool_name,
			command: command.trim(),
		};
	} catch {
		return undefined;
	}
}

function preToolUseOutput(decision: HookDecision) {
	if (decision.permissionDecision === "allow") {
		return {
			hookSpecificOutput: {
				hookEventName: "PreToolUse",
				permissionDecision: "allow",
				permissionDecisionReason: decision.permissionDecisionReason,
			},
		};
	}
	return { decision: "block", reason: decision.permissionDecisionReason };
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

export async function codexHook(): Promise<void> {
	const input = parseInput(await readStdin());
	if (!input) return;

	const decision = decideCommand(input.toolName, input.command);
	if (!decision) return;

	const output =
		input.event === "PermissionRequest"
			? permissionRequestOutput(decision)
			: preToolUseOutput(decision);

	console.log(JSON.stringify(output));
}
