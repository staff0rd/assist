import { basename } from "node:path";
import { readStdin } from "../lib/readStdin";
import { isDocsLocked } from "./backlog/isDocsLocked";
import { decideCommand } from "./cliHook/decideCommand";
import { findAskQuestionDeny } from "./cliHook/findAskQuestionDeny";
import { findDocsPathDeny } from "./cliHook/findDocsPathDeny";
import { findRestrictedPathDeny } from "./cliHook/findRestrictedPathDeny";
import { logDeniedToolCall } from "./cliHook/logDeniedToolCall";
import type { HookDecision } from "./cliHook/resolvePermission";
import { tryParseInput } from "./cliHook/tryParseInput";

async function decideBash(
	toolName: string,
	command: string,
): Promise<HookDecision | undefined> {
	const decision = decideCommand(toolName, command);
	if (decision?.permissionDecision === "deny") return decision;
	const docsDeny = findDocsPathDeny(toolName, command);
	if (docsDeny && (await isDocsLocked())) return docsDeny;
	return decision;
}

export async function cliHook(): Promise<void> {
	const input = tryParseInput(await readStdin());
	if (!input) return;

	const decision =
		input.kind === "command"
			? await decideBash(input.toolName, input.command)
			: input.kind === "question"
				? await findAskQuestionDeny(input.command)
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
