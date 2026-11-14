import { highLevelChangedFileCount } from "../../../../../../../review/highLevel/highLevelChangedFileCount";
import { highLevelTestCount } from "../../../../../../../review/highLevel/highLevelTestCount";
import type { HighLevelPreviewPayload } from "../../../../../../../review/highLevel/types";
import { type HighLevelArea, highLevelAreaCheck } from "./highLevelAreaCheck";
import type { HighLevelSliceView } from "./highLevelSliceViews";

export type HighLevelReviewEntry = {
	view?: HighLevelSliceView;
	additions: number;
	deletions: number;
	areas: HighLevelArea[];
	disabled: ReadonlySet<HighLevelArea>;
	counts: Partial<Record<HighLevelArea, number>>;
};

function overview(payload: HighLevelPreviewPayload): HighLevelReviewEntry {
	const has = (area: HighLevelArea) =>
		payload.checks.some((check) => check.id === highLevelAreaCheck(area));
	const areas: HighLevelArea[] = [
		"description",
		"checks",
		...(has("manual") ? (["manual"] as const) : []),
		"all",
		...(has("backend") ? (["backend"] as const) : []),
	];
	return {
		additions: payload.structure.additions,
		deletions: payload.structure.deletions,
		areas,
		disabled: new Set(),
		counts: {
			checks: payload.checks.filter((check) => check.kind === "deterministic")
				.length,
			manual: payload.manualTesting?.steps.length ?? 0,
			all: highLevelChangedFileCount(payload.structure),
		},
	};
}

function sliceEntry(view: HighLevelSliceView): HighLevelReviewEntry {
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
	};
}

export function highLevelReviewEntries(
	payload: HighLevelPreviewPayload,
	views: HighLevelSliceView[],
): HighLevelReviewEntry[] {
	return [overview(payload), ...views.map(sliceEntry)];
}
