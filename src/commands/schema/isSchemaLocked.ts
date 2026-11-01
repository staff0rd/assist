import { existsSync } from "node:fs";
import { closeDb } from "../../shared/db/getDb";
import { resolveSessionItemId } from "../../shared/resolveSessionItemId";
import { hasOpenPhaseUnlock } from "../backlog/hasOpenPhaseUnlock";
import { getSchemaSessionApprovalPath } from "./getSchemaSessionApprovalPath";

function hasSessionApproval(): boolean {
	const claudeSessionId = process.env.CLAUDE_CODE_SESSION_ID;
	if (!claudeSessionId) return false;
	const path = getSchemaSessionApprovalPath(claudeSessionId);
	return path !== undefined && existsSync(path);
}

export async function isSchemaLocked(): Promise<boolean> {
	if (!process.env.CLAUDECODE) return false;
	const itemId = resolveSessionItemId();
	if (itemId === null) return !hasSessionApproval();
	try {
		return !(await hasOpenPhaseUnlock(itemId, "schema-unlock"));
	} catch {
		return true;
	} finally {
		await closeDb().catch(() => {});
	}
}
