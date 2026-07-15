import { basename } from "node:path";
import { readStdin } from "../../lib/readStdin";
import { decideCommand } from "./decideCommand";
import { logDeniedToolCall } from "./logDeniedToolCall";

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

export async function cliHook(): Promise<void> {
	const input = tryParseInput(await readStdin());
	if (!input) return;

	const decision = decideCommand(input.toolName, input.command);
	if (!decision) return;

	console.log(
		JSON.stringify({
			hookSpecificOutput: { hookEventName: "PreToolUse", ...decision },
		}),
	);

	if (decision.permissionDecision === "deny") {
		try {
			logDeniedToolCall({
				tool: input.toolName,
				command: input.command,
				repo: basename(process.cwd()),
				sessionId: process.env.CLAUDE_SESSION_ID,
				denyReason: decision.permissionDecisionReason,
			});
		} catch {
			// DB write failure must not affect hook output
		}
	}
}
