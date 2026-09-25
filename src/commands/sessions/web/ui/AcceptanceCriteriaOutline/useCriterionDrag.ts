import {
	type PointerEvent as ReactPointerEvent,
	type RefObject,
	useState,
} from "react";
import type { CriteriaEdit } from "./CriteriaEdit";
import type { CriterionDrag } from "./CriterionDrag";
import { criterionDragMeasure } from "./useCriterionDrag/criterionDragMeasure";
import { criterionDragSession } from "./useCriterionDrag/criterionDragSession";
import { dropCriterion } from "./useCriterionDrag/dropCriterion";
import type { AcceptanceCriterion } from "../splitAcceptanceCriteria";

export function useCriterionDrag(
	items: AcceptanceCriterion[],
	listRef: RefObject<HTMLElement | null>,
	onDrop: (edit: CriteriaEdit) => void,
) {
	const [drag, setDrag] = useState<CriterionDrag | null>(null);

	const onGrip = (index: number) => (event: ReactPointerEvent<HTMLElement>) => {
		const list = listRef.current;
		if (!list || (event.pointerType === "mouse" && event.button !== 0)) return;
		event.preventDefault();
		const track = criterionDragSession(
			event.currentTarget,
			event.pointerId,
			criterionDragMeasure(items, list, index, event.clientX),
			(plan) => setDrag({ from: index, depth: plan.depth, top: plan.top }),
			(plan) => {
				setDrag(null);
				onDrop(dropCriterion(items, index, plan.target, plan.depth));
			},
		);
		track(event);
	};

	return { drag, onGrip };
}
