import { depthSteps } from "../criterionIndent";
import type { AcceptanceCriterion } from "../../splitAcceptanceCriteria";
import { subtreeEnd } from "../subtreeEnd";

type CriterionRowBox = { top: number; height: number };

export type DropPlan = { target: number; depth: number; top: number };

function dropTarget(
	rows: CriterionRowBox[],
	items: AcceptanceCriterion[],
	from: number,
	y: number,
): number {
	let target = items.length;
	for (let i = 0; i < rows.length; i += 1) {
		if (y < rows[i].top + rows[i].height / 2) {
			target = i;
			break;
		}
	}
	const end = subtreeEnd(items, from);
	return target > from && target < end ? from : target;
}

function dropDepth(
	items: AcceptanceCriterion[],
	from: number,
	target: number,
	dx: number,
): number {
	const end = subtreeEnd(items, from);
	const raw = target - 1;
	const above = raw >= from && raw < end ? from - 1 : raw;
	const ceiling = above >= 0 ? items[above].depth + 1 : 0;
	return Math.max(0, Math.min(items[from].depth + depthSteps(dx), ceiling));
}

function dropTop(rows: CriterionRowBox[], target: number): number {
	if (target < rows.length) return rows[target].top;
	const last = rows[rows.length - 1];
	return last ? last.top + last.height : 0;
}

export function criterionDropPlan(
	rows: CriterionRowBox[],
	items: AcceptanceCriterion[],
	from: number,
	dx: number,
	y: number,
): DropPlan {
	const target = dropTarget(rows, items, from, y);
	return {
		target,
		depth: dropDepth(items, from, target, dx),
		top: dropTop(rows, target),
	};
}
