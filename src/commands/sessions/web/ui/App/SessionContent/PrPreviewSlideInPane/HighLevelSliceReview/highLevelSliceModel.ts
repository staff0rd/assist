import type { HighLevelPreviewPayload } from "../../../../../../../review/highLevel/types";
import type { HighLevelSlicing } from "../HighLevelReviewPane/useHighLevelChecklist/highLevelChecklistTargets";
import {
	type HighLevelReviewEntry,
	highLevelReviewEntries,
} from "./highLevelReviewEntries";
import { highLevelSliceViews } from "./highLevelSliceViews";

export type HighLevelSliceModel = {
	entries: HighLevelReviewEntry[];
	slicing: HighLevelSlicing;
};

export function highLevelSliceModel(
	payload: HighLevelPreviewPayload,
): HighLevelSliceModel | undefined {
	if (!payload.slices) return undefined;
	const views = highLevelSliceViews(payload, payload.slices);
	return {
		entries: highLevelReviewEntries(payload, views),
		slicing: {
			count: views.length,
			noCritical: new Set(
				views
					.filter((view) => view.critical.length === 0)
					.map((view) => view.number),
			),
		},
	};
}
