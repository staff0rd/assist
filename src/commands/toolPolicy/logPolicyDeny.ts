import { basename } from "node:path";
import type {
	ExecutionIdentity,
	ToolOperation,
} from "../../shared/harnessAdapters/types";
import { logDeniedToolCall } from "../cliHook/logDeniedToolCall";
import type { HookDecision } from "../cliHook/resolvePermission";

function describe(operation: ToolOperation): string {
	switch (operation.kind) {
		case "command":
			return operation.command;
		case "fileRead":
			return operation.paths.join(" ");
		case "fileWrite":
			return operation.path;
		case "question":
			return operation.questionsJson;
	}
}

export function logPolicyDeny(
	operations: ToolOperation[],
	decision: HookDecision | undefined,
	identity: ExecutionIdentity | undefined,
	cwd: string = process.cwd(),
): void {
	if (decision?.permissionDecision !== "deny" || operations.length === 0)
		return;
	try {
		logDeniedToolCall({
			tool: operations[0].tool,
			command: operations.map(describe).join("\n"),
			repo: basename(cwd),
			sessionId: identity?.conversationId,
			denyReason: decision.permissionDecisionReason,
		});
	} catch {}
}
