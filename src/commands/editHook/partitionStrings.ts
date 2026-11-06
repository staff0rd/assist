import { type EditHookInput } from "./decideOverrideGuard";
import { type EditPair, widenToLines } from "./widenToLines";

type Edit = { old_string?: string; new_string?: string };

function defined(values: (string | undefined)[]): string[] {
	return values.filter((value): value is string => value != null);
}

function widenEdits(edits: Edit[], existingContent: string | undefined) {
	let content = existingContent;
	const pairs: Partial<EditPair>[] = [];
	for (const { old_string, new_string } of edits) {
		if (content == null || old_string == null || new_string == null) {
			pairs.push({ removed: old_string, added: new_string });
			continue;
		}
		pairs.push(widenToLines(content, old_string, new_string));
		content = content.replace(old_string, () => new_string);
	}
	return {
		added: defined(pairs.map((p) => p.added)),
		removed: defined(pairs.map((p) => p.removed)),
	};
}

export function partitionStrings(
	input: EditHookInput,
	existingContent: string | undefined,
): { added: string[]; removed: string[] } {
	const { tool_name, tool_input } = input;
	switch (tool_name) {
		case "Edit":
			return widenEdits([tool_input], existingContent);
		case "MultiEdit":
			return widenEdits(tool_input.edits ?? [], existingContent);
		case "Write":
			return {
				added: defined([tool_input.content]),
				removed: defined([existingContent]),
			};
		default:
			return { added: [], removed: [] };
	}
}
