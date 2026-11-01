import { join } from "node:path";
import { getRestrictedDir } from "../codeComment/getRestrictedDir";

const SESSION_ID = /^[\w-]+$/;

export function getSchemaSessionApprovalDir(): string {
	return join(getRestrictedDir(), "schema-sessions");
}

export function getSchemaSessionApprovalPath(
	claudeSessionId: string,
): string | undefined {
	if (!SESSION_ID.test(claudeSessionId)) return undefined;
	return join(getSchemaSessionApprovalDir(), `${claudeSessionId}.json`);
}
