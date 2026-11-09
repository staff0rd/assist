import type { ToolOperation } from "../../shared/harnessAdapters/types";
import { isDocsLocked } from "../backlog/isDocsLocked";
import { DOCS_LOCK_REASON, isDocsPath } from "../backlog/isDocsPath";

export async function decideDocsGuard({
	path,
}: Extract<ToolOperation, { kind: "fileWrite" }>): Promise<string | undefined> {
	if (!isDocsPath(path)) return undefined;
	return (await isDocsLocked()) ? DOCS_LOCK_REASON : undefined;
}
