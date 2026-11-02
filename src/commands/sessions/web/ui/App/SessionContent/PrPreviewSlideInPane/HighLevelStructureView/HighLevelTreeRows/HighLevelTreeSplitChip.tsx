import type { HighLevelSliceSplit } from "../../../../../../../../review/highLevel/types";
import { HighLevelTreeTag } from "./HighLevelTreeTag";

export function HighLevelTreeSplitChip({
	split,
}: {
	split: HighLevelSliceSplit;
}) {
	return (
		<HighLevelTreeTag
			label={`${split.hunks} of ${split.of} hunks`}
			title="The rest of this file's hunks are in other slices"
		/>
	);
}
