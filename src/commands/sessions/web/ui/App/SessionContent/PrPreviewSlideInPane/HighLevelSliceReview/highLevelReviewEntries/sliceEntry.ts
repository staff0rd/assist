import type { HighLevelReviewEntry } from "../highLevelReviewEntries";
import { highLevelChangedFileCount } from "../../../../../../../../review/highLevel/highLevelChangedFileCount";
import { highLevelTestCount } from "../../../../../../../../review/highLevel/highLevelTestCount";
import type { HighLevelSliceView } from "../highLevelSliceViews";

export function sliceEntry(view: HighLevelSliceView): HighLevelReviewEntry {
	return {
		view,
		additions: view.slice.additions,
		deletions: view.slice.deletions,
		areas: ["structure", "tests", "critical"],
		disabled: new Set(view.critical.length === 0 ? ["critical"] : []),
		counts: {
			structure: highLevelChangedFileCount(view.structure),
			tests: highLevelTestCount(view.tests),
			critical: view.critical.length,
		},
		failures: {},
	};
}
