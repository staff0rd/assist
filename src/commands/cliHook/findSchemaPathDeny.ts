import { SCHEMA_LOCK_REASON } from "../schema/isSchemaPath";
import type { HookDecision } from "./resolvePermission";

const SCHEMA_MARKER = /shared\/db\b|migrations\/migration/;

export function findSchemaPathDeny(
	rawCommand: string,
): HookDecision | undefined {
	if (!SCHEMA_MARKER.test(rawCommand.replace(/\\/g, "/"))) return undefined;
	return {
		permissionDecision: "deny",
		permissionDecisionReason: SCHEMA_LOCK_REASON,
	};
}
