import { join } from "node:path";
import { legacyDefaultHarness } from "../../shared/harnessLabel";
import { getRestrictedDir } from "../codeComment/getRestrictedDir";

const SESSION_ID = /^[\w-]+$/;

export type SchemaSessionScope = { harness: string; conversationId: string };

export function getSchemaSessionApprovalDir(): string {
	return join(getRestrictedDir(), "schema-sessions");
}

export function getSchemaSessionApprovalPath(
	scope: SchemaSessionScope,
): string | undefined {
	const { harness, conversationId } = scope;
	if (!SESSION_ID.test(conversationId) || !SESSION_ID.test(harness))
		return undefined;
	const name =
		harness === legacyDefaultHarness
			? conversationId
			: `${harness}-${conversationId}`;
	return join(getSchemaSessionApprovalDir(), `${name}.json`);
}
