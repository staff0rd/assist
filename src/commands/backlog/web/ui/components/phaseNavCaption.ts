import type { BacklogItem, PlanPhase } from "../types";
import { dependsOnCaption } from "./dependsOnCaption";
import { runCaption } from "./runCaption";

/** A phase nav row's caption: its Running/Queued state and its dependencies when they differ from the previous phase. */
export function phaseNavCaption(
	item: BacklogItem,
	phase: PlanPhase,
	index: number,
	authoredCount: number,
): string | undefined {
	const caption = [
		index < authoredCount ? runCaption(item, phase, index) : undefined,
		dependsOnCaption(phase, index),
	]
		.filter(Boolean)
		.join(" · ");
	return caption || undefined;
}
