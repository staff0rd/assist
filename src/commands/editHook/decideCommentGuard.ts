import { isYamlFile } from "../../shared/isYamlFile";
import { type EditHookInput } from "./decideOverrideGuard";
import { extractComments, isSourceFile } from "./extractComments";
import { extractYamlComments } from "./extractYamlComments";
import { introducedComments } from "./introducedComments";

function denyReason(marker: string): string {
	const blockClause = marker === "//" ? ", no block comments" : "";
	return (
		`This edit introduces a code comment (${marker}), which is blocked by the ` +
		"comment gate. Comments are a last resort — prefer a clearer name, a smaller " +
		"function, or a test that makes the comment unnecessary. The comment must " +
		"not appear in your edit itself. If this one line genuinely earns its keep, " +
		'use the escape hatch: run `assist code-comment set <file> <line> "<text>"` ' +
		`(single line, max 50 chars${blockClause}) to get a pin, then ` +
		"`assist code-comment confirm <pin>` to insert it."
	);
}

function defined(values: (string | undefined)[]): string[] {
	return values.filter((value): value is string => value != null);
}

function partitionStrings(
	input: EditHookInput,
	existingContent: string | undefined,
): { added: string[]; removed: string[] } {
	const { tool_name, tool_input } = input;
	switch (tool_name) {
		case "Edit":
			return {
				added: defined([tool_input.new_string]),
				removed: defined([tool_input.old_string]),
			};
		case "MultiEdit": {
			const edits = tool_input.edits ?? [];
			return {
				added: defined(edits.map((e) => e.new_string)),
				removed: defined(edits.map((e) => e.old_string)),
			};
		}
		case "Write":
			return {
				added: defined([tool_input.content]),
				removed: defined([existingContent]),
			};
		default:
			return { added: [], removed: [] };
	}
}

export function decideCommentGuard(
	input: EditHookInput,
	existingContent?: string,
): string | undefined {
	const filePath = input.tool_input.file_path;
	const yaml = isYamlFile(filePath);
	if (!isSourceFile(filePath) && !yaml) return undefined;

	const extract = yaml ? extractYamlComments : extractComments;
	const { added, removed } = partitionStrings(input, existingContent);
	const introduced = introducedComments(
		added.flatMap(extract),
		removed.flatMap(extract),
	);
	return introduced.length > 0 ? denyReason(yaml ? "#" : "//") : undefined;
}
