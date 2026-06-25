import { type EditHookInput } from "./decideOverrideGuard";
import { extractComments, isSourceFile } from "./extractComments";

const DENY_REASON =
	"This edit introduces a code comment, which is blocked by the comment gate. " +
	"Comments are a last resort — prefer a clearer name, a smaller function, or a " +
	"test that makes the comment unnecessary. The comment must not appear in your " +
	"edit itself. If this one line genuinely earns its keep, use the escape hatch: " +
	'run `assist code-comment set <file> <line> "<text>"` (single line, max 50 ' +
	"chars, no block comments) to get a pin, then `assist code-comment confirm " +
	"<pin>` to insert it.";

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

/** Comments present in `added` that are not accounted for by `removed`. */
function introducedComments(added: string[], removed: string[]): string[] {
	const counts = new Map<string, number>();
	for (const comment of removed) {
		counts.set(comment, (counts.get(comment) ?? 0) + 1);
	}

	const introduced: string[] = [];
	for (const comment of added) {
		const remaining = counts.get(comment) ?? 0;
		if (remaining > 0) counts.set(comment, remaining - 1);
		else introduced.push(comment);
	}
	return introduced;
}

export function decideCommentGuard(
	input: EditHookInput,
	existingContent?: string,
): string | undefined {
	if (!isSourceFile(input.tool_input.file_path)) return undefined;

	const { added, removed } = partitionStrings(input, existingContent);
	const introduced = introducedComments(
		added.flatMap(extractComments),
		removed.flatMap(extractComments),
	);
	return introduced.length > 0 ? DENY_REASON : undefined;
}
