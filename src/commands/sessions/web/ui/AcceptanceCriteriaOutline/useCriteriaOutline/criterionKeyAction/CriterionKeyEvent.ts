import type { CriteriaEdit } from "../../CriteriaEdit";
import type { CriterionCaret } from "../../CriterionFocus";

export type CriterionKeyEvent = {
	key: string;
	shift: boolean;
	alt: boolean;
	caret: number;
	text: string;
};

export type CriterionKeyAction =
	| { kind: "edit"; edit: CriteriaEdit; caret: CriterionCaret }
	| { kind: "focus"; index: number };
