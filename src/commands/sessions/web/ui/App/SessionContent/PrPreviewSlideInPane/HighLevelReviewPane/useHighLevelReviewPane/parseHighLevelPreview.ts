import type { HighLevelPreviewPayload } from "../../../../../../../../review/highLevel/types";
import { isCheck } from "./parseHighLevelPreview/isCheck";
import { asArray } from "./parseHighLevelPreview/asArray";
import { parsePreviewHead } from "./parseHighLevelPreview/parsePreviewHead";

const EMPTY: HighLevelPreviewPayload = {
	repo: "",
	prNumber: 0,
	headSha: "",
	body: "",
	checks: [],
	structure: {
		tree: [],
		added: 0,
		removed: 0,
		modified: 0,
		additions: 0,
		deletions: 0,
	},
	criticalDiffs: [],
	criticalPaths: [],
	tests: [],
	testPaths: [],
	collapsedPaths: [],
};

export function parseHighLevelPreview(body: string): HighLevelPreviewPayload {
	let parsed: Partial<HighLevelPreviewPayload>;
	try {
		parsed = JSON.parse(body) as Partial<HighLevelPreviewPayload>;
	} catch {
		return EMPTY;
	}
	if (typeof parsed !== "object" || parsed === null) return EMPTY;
	return {
		...parsePreviewHead(parsed),
		checks: asArray(parsed.checks, isCheck),
		structure: { ...EMPTY.structure, ...parsed.structure },
		criticalDiffs: asArray(parsed.criticalDiffs),
		criticalPaths: asArray(parsed.criticalPaths),
		tests: asArray(parsed.tests),
		testPaths: asArray(parsed.testPaths),
		collapsedPaths: asArray(parsed.collapsedPaths),
		...(Array.isArray(parsed.slices) ? { slices: parsed.slices } : {}),
		...(parsed.manualTesting ? { manualTesting: parsed.manualTesting } : {}),
		...(parsed.saved ? { saved: parsed.saved } : {}),
		...(parsed.draft ? { draft: parsed.draft } : {}),
	};
}
