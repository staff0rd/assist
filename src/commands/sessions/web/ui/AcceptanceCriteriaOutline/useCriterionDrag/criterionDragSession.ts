import type { CriterionPoint } from "../CriterionDrag";
import type { DropPlan } from "./criterionDropPlan";

export function criterionDragSession(
	grip: HTMLElement,
	pointerId: number,
	measure: (at: CriterionPoint) => DropPlan,
	onPlan: (plan: DropPlan) => void,
	onSettled: (plan: DropPlan) => void,
): (at: CriterionPoint) => void {
	const stop = new AbortController();
	let plan: DropPlan | null = null;
	const track = (at: CriterionPoint) => {
		plan = measure(at);
		onPlan(plan);
	};
	const done = () => {
		stop.abort();
		if (plan) onSettled(plan);
	};
	const on = { signal: stop.signal };
	grip.setPointerCapture(pointerId);
	grip.addEventListener("pointermove", track, on);
	grip.addEventListener("pointerup", done, on);
	grip.addEventListener("pointercancel", done, on);
	return track;
}
