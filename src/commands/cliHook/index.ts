import { basename } from "node:path";
import { readStdin } from "../../lib/readStdin";
import { decideCommand } from "./decideCommand";
import { findRestrictedPathDeny } from "./findRestrictedPathDeny";
import { logDeniedToolCall } from "./logDeniedToolCall";
import { tryParseInput } from "./tryParseInput";

export async function cliHook(): Promise<void> {
	const input = tryParseInput(await readStdin());
	if (!input) return;

	const decision =
		input.kind === "command"
			? decideCommand(input.toolName, input.command)
			: findRestrictedPathDeny(input.paths);
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
