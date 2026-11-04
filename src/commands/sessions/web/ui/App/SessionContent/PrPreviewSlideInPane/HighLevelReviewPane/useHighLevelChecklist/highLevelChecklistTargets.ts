import { isHighLevelSliceCheck } from "../../../../../../../../review/highLevel/isHighLevelSliceCheck";
import type { HighLevelCheckResult } from "../../../../../../../../review/highLevel/types";

export type HighLevelSlicing = {
	count: number;
	noCritical: ReadonlySet<number>;
};

export type HighLevelChecklistTarget = {
	key: string;
	check: HighLevelCheckResult;
	slice?: number;
	locked: boolean;
};

export function highLevelItemKey(id: string, slice?: number): string {
	return slice === undefined ? id : `${id}@${slice}`;
}

function sliceTargets(
	check: HighLevelCheckResult,
	slicing: HighLevelSlicing,
): HighLevelChecklistTarget[] {
	return Array.from({ length: slicing.count }, (_, index) => {
		const slice = index + 1;
		return {
			key: highLevelItemKey(check.id, slice),
			check,
			slice,
			locked:
				check.id === "critical-diffs-correct" && slicing.noCritical.has(slice),
		};
	});
}

export function highLevelChecklistTargets(
	checks: HighLevelCheckResult[],
	slicing: HighLevelSlicing | undefined,
): HighLevelChecklistTarget[] {
	return checks.flatMap((check) =>
		slicing && isHighLevelSliceCheck(check.id)
			? sliceTargets(check, slicing)
			: [{ key: check.id, check, locked: false }],
	);
}
