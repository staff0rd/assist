import type { PointerEvent as ReactPointerEvent } from "react";
import type { AcceptanceCriterion } from "../../splitAcceptanceCriteria";
import type { useCriteriaOutline } from "../useCriteriaOutline";

export type CriterionRowProps = {
	index: number;
	number: string;
	item: AcceptanceCriterion;
	outline: ReturnType<typeof useCriteriaOutline>;
	dragging: boolean;
	onGrip: (event: ReactPointerEvent<HTMLElement>) => void;
};
