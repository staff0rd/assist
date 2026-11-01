import { isSchemaLocked } from "../schema/isSchemaLocked";
import { isSchemaPath, SCHEMA_LOCK_REASON } from "../schema/isSchemaPath";
import { type EditHookInput } from "./decideOverrideGuard";

const WRITE_TOOLS = new Set(["Edit", "Write", "MultiEdit"]);

function incomingContents(input: EditHookInput): string[] {
	const { content, new_string, edits = [] } = input.tool_input;
	return [content, new_string, ...edits.map((e) => e.new_string)].filter(
		(s): s is string => s !== undefined,
	);
}

export async function decideSchemaGuard(
	input: EditHookInput,
): Promise<string | undefined> {
	const filePath = input.tool_input.file_path;
	if (!WRITE_TOOLS.has(input.tool_name) || !filePath) return undefined;
	if (!isSchemaPath(filePath, incomingContents(input))) return undefined;
	return (await isSchemaLocked()) ? SCHEMA_LOCK_REASON : undefined;
}
