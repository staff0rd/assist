import type { HighLevelStructure } from "./types";

export function highLevelChangedFileCount(
	structure: HighLevelStructure,
): number {
	return structure.added + structure.removed + structure.modified;
}
