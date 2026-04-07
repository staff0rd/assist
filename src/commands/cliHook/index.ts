import { readStdin } from "../../lib/readStdin";
import { splitCompound } from "../../shared/splitCompound";
import { findDeny, resolvePermission } from "./resolvePermission";

type HookInput = {
	hook_event_name: string;
	tool_name: string;
	tool_input: {
		command?: string;
	};
};

const SUPPORTED_TOOLS = new Set(["Bash", "PowerShell"]);

function tryParseInput(
	raw: string,
): { toolName: string; command: string } | undefined {
	try {
		const data: HookInput = JSON.parse(raw);
		if (!SUPPORTED_TOOLS.has(data.tool_name) || !data.tool_input?.command)
			return undefined;
		return {
			toolName: data.tool_name,
			command: data.tool_input.command.trim(),
		};
	} catch {
		return undefined;
	}
}

function decide(toolName: string, rawCommand: string) {
	const parts = splitCompound(rawCommand);
	if (parts) return resolvePermission(toolName, parts);
	// Command couldn't be decomposed — still check deny rules against the raw command
	return findDeny(toolName, [rawCommand]);
}

export async function cliHook(): Promise<void> {
	const input = tryParseInput(await readStdin());
	if (!input) return;

	const decision = decide(input.toolName, input.command);
	if (!decision) return;

	console.log(
		JSON.stringify({
			hookSpecificOutput: { hookEventName: "PreToolUse", ...decision },
		}),
	);
}
