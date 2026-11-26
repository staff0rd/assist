import type { HighLevelHunk } from "./listHighLevelHunks";
import type { HighLevelSliceInput } from "./parseHighLevelSlicesInput";

export function knownRefs(
	input: HighLevelSliceInput,
	byRef: Map<string, HighLevelHunk>,
	warnings: string[],
): string[] {
	return [...new Set(input.hunks)].filter((ref) => {
		if (byRef.has(ref)) return true;
		warnings.push(`Dropped unknown hunk ${ref} from "${input.title}".`);
		return false;
	});
}
