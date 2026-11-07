import { basename } from "node:path";
import { logDeniedToolCall } from "../cliHook/logDeniedToolCall";
import type { HookDecision } from "../cliHook/resolvePermission";
import type { ParsedInput } from "./parseCodexHookInput";

export function logCodexDeniedCall(
	input: ParsedInput,
	decision: HookDecision | undefined,
): void {
	if (decision?.permissionDecision !== "deny") return;
	if (!input.toolName || !input.command) return;
	try {
		logDeniedToolCall({
			tool: input.toolName,
			command: input.command,
			repo: basename(input.cwd ?? process.cwd()),
			sessionId: input.sessionId ?? process.env.CODEX_THREAD_ID,
			denyReason: decision.permissionDecisionReason,
		});
	} catch {}
}
