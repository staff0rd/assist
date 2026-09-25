import type { CriterionCaret } from "../../CriterionFocus";

export function caretOffset(caret: CriterionCaret, length: number): number {
	if (caret === "start") return 0;
	if (caret === "end") return length;
	return Math.min(Math.max(caret, 0), length);
}
