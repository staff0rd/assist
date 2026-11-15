import { SCHEMA_LOCK_REASON } from "../schema/isSchemaPath";
import type { HookDecision } from "./resolvePermission";

const SCHEMA_MARKERS = ["shared/db/", "migrations/migration"];

export function findSchemaPathDeny(
	rawCommand: string,
): HookDecision | undefined {
	const normalized = rawCommand.replace(/\\/g, "/");
	if (!SCHEMA_MARKERS.some((marker) => normalized.includes(marker)))
		return undefined;
	return {
		permissionDecision: "deny",
		permissionDecisionReason: SCHEMA_LOCK_REASON,
	};
}
