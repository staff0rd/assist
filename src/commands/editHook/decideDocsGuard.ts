import { isDocsLocked } from "../backlog/isDocsLocked";
import { DOCS_LOCK_REASON, isDocsPath } from "../backlog/isDocsPath";
import { type EditHookInput } from "./decideOverrideGuard";

const WRITE_TOOLS = new Set(["Edit", "Write", "MultiEdit"]);

export async function decideDocsGuard(
	input: EditHookInput,
): Promise<string | undefined> {
	const filePath = input.tool_input.file_path;
	if (!WRITE_TOOLS.has(input.tool_name) || !filePath) return undefined;
	if (!isDocsPath(filePath)) return undefined;
	return (await isDocsLocked()) ? DOCS_LOCK_REASON : undefined;
}
