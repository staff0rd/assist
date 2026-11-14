import type { HighLevelCheckId } from "../../../../../../../review/highLevel/highLevelChecklist";

export type HighLevelArea =
	| "description"
	| "checks"
	| "manual"
	| "all"
	| "backend"
	| "structure"
	| "tests"
	| "critical";

export const highLevelAreaLabels: Record<HighLevelArea, string> = {
	description: "Description",
	checks: "Checks",
	manual: "Manual testing",
	all: "All files",
	backend: "Backend PR",
	structure: "Structure",
	tests: "Tests",
	critical: "Critical diffs",
};

const AREA_CHECKS: Partial<Record<HighLevelArea, HighLevelCheckId>> = {
	manual: "manual-testing",
	backend: "backend-pr-linked",
	structure: "structure-sensible",
	tests: "tests-worth-having",
	critical: "critical-diffs-correct",
};

export function highLevelAreaCheck(
	area: HighLevelArea,
): HighLevelCheckId | undefined {
	return AREA_CHECKS[area];
}
