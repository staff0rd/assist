import {
	gatherHighLevelSlices,
	type HighLevelSlicing,
} from "./gatherHighLevelSlices";
import type {
	HighLevelGathered,
	HighLevelGatherHead,
} from "./HighLevelSubjectCache";
import { loadHighLevelSubjectCache } from "./loadHighLevelSubjectCache";
import type { HighLevelConfig } from "./resolveHighLevelConfig";

export function reuseCachedHighLevelSubject(
	head: HighLevelGatherHead,
	config: HighLevelConfig,
	slicing: HighLevelSlicing | undefined,
): HighLevelGathered | undefined {
	if (!slicing?.reuseOnly || slicing.slicesFile) return undefined;
	const cache = loadHighLevelSubjectCache(head, config);
	if (!cache) return undefined;
	// reuseOnly never reads files: it returns the saved slices or exits.
	return { cache, sliced: gatherHighLevelSlices(head, [], slicing) };
}
