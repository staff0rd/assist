import { existsSync, readFileSync } from "node:fs";
import { currentExecutionIdentity } from "../../shared/currentExecutionIdentity";
import { closeDb } from "../../shared/db/getDb";
import type { ExecutionIdentity } from "../../shared/harnessAdapters/types";
import { hasOpenPhaseUnlock } from "../backlog/hasOpenPhaseUnlock";
import { getSchemaSessionApprovalPath } from "./getSchemaSessionApprovalPath";

function approvalMatches(path: string, identity: ExecutionIdentity): boolean {
	try {
		const approval: Record<string, unknown> = JSON.parse(
			readFileSync(path, "utf8"),
		);
		const conversation = approval.conversationId ?? approval.claudeSessionId;
		if (approval.harness !== undefined && approval.harness !== identity.harness)
			return false;
		return (
			conversation === undefined || conversation === identity.conversationId
		);
	} catch {
		return false;
	}
}

function hasSessionApproval(identity: ExecutionIdentity): boolean {
	const { harness, conversationId } = identity;
	if (!conversationId) return false;
	const path = getSchemaSessionApprovalPath({ harness, conversationId });
	return (
		path !== undefined && existsSync(path) && approvalMatches(path, identity)
	);
}

export async function isSchemaLocked(
	identity: ExecutionIdentity | undefined = currentExecutionIdentity(),
): Promise<boolean> {
	if (!identity) return false;
	if (identity.itemId === null) return !hasSessionApproval(identity);
	try {
		return !(await hasOpenPhaseUnlock(
			identity.itemId,
			"schema-unlock",
			identity.harness,
		));
	} catch {
		return true;
	} finally {
		await closeDb().catch(() => {});
	}
}
