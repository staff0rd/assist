import type { BacklogTarget } from "../../../backlogTarget";
import type { ChildDismiss } from "../../../types";

function nestedNote(childDismiss?: ChildDismiss) {
	if (!childDismiss) return "";
	const { childCount } = childDismiss;
	const noun = childCount === 1 ? "session" : "sessions";
	return ` Its ${childCount} nested ${noun} will also be closed.`;
}

export function markDoneMessage(
	{ phase, totalPhases }: BacklogTarget,
	childDismiss?: ChildDismiss,
) {
	return `${phase ?? 0} of ${totalPhases ?? 0} phases completed. Mark this backlog item as done and end its session?${nestedNote(childDismiss)}`;
}
