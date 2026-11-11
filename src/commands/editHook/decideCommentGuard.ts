import { isCommentGateIgnored } from "../../shared/isCommentGateIgnored";
import { isGeneratedCsharpFile } from "../../shared/isGeneratedCsharpFile";
import { type EditHookInput } from "./decideOverrideGuard";
import { introducedComments } from "./introducedComments";
import { partitionStrings } from "./partitionStrings";
import { selectCommentExtractor } from "./selectCommentExtractor";

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

export function decideCommentGuard(
	input: EditHookInput,
	existingContent?: string,
	ignoreGlobs: string[] = [],
): string | undefined {
	const { file_path, content } = input.tool_input;
	if (isGeneratedCsharpFile(file_path, content)) return undefined;
	if (file_path && isCommentGateIgnored(file_path, ignoreGlobs))
		return undefined;

	const gate = selectCommentExtractor(file_path);
	if (!gate) return undefined;

	const { added, removed } = partitionStrings(input, existingContent);
	const introduced = introducedComments(
		added.flatMap(gate.extract),
		removed.flatMap(gate.extract),
	);
	return introduced.length > 0 ? denyReason(gate.marker) : undefined;
}
