import type { CriterionPoint } from "../CriterionDrag";
import { criterionDropPlan, type DropPlan } from "./criterionDropPlan";
import type { AcceptanceCriterion } from "../../splitAcceptanceCriteria";

function rowBoxes(list: HTMLElement) {
	const origin = list.getBoundingClientRect().top;
	const boxes = Array.from(
		list.querySelectorAll<HTMLElement>("[data-criterion-row]"),
	).map((row) => {
		const box = row.getBoundingClientRect();
		return { top: box.top - origin, height: box.height };
	});
	return { boxes, origin };
}

export function criterionDragMeasure(
	items: AcceptanceCriterion[],
	list: HTMLElement,
	index: number,
	startX: number,
): (at: CriterionPoint) => DropPlan {
	return (at) => {
		const { boxes, origin } = rowBoxes(list);
		return criterionDropPlan(
			boxes,
			items,
			index,
			at.clientX - startX,
			at.clientY - origin,
		);
	};
}
