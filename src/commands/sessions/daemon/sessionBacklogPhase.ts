import type { Session } from "./createSession";

/**
 * The backlog item id and 0-based phase index a session is currently running,
 * or undefined when the session isn't on a backlog phase. The 0-based index
 * lines up with `plan_phases.idx`, converting from the activity's 1-based phase.
 */
export function sessionBacklogPhase(
	session: Session,
): { itemId: number; phaseIdx: number } | undefined {
	const activity = session.activity;
	if (activity?.kind !== "backlog") return undefined;
	if (activity.itemId == null || activity.phase == null) return undefined;
	return { itemId: activity.itemId, phaseIdx: activity.phase - 1 };
}
