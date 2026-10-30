import { isApprovedRead } from "../../shared/isApprovedRead";
import { splitCompound } from "../../shared/splitCompound";
import { DOCS_LOCK_REASON, mentionsDocsPath } from "../backlog/isDocsPath";
import type { HookDecision } from "./resolvePermission";

export function findDocsPathDeny(
	toolName: string,
	rawCommand: string,
	root?: string,
): HookDecision | undefined {
	const result = splitCompound(rawCommand);
	const parts = result.ok ? result.parts : [rawCommand];
	const writes = parts.some(
		(part) => mentionsDocsPath(part, root) && !isApprovedRead(part, toolName),
	);
	if (!writes) return undefined;
	return {
		permissionDecision: "deny",
		permissionDecisionReason: DOCS_LOCK_REASON,
	};
}
