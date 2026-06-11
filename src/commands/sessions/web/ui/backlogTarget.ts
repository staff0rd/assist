import type { SessionInfo } from "./types";

export type BacklogTarget = {
	itemId: number;
	phase?: number;
	totalPhases?: number;
};

export function backlogTarget(session: SessionInfo): BacklogTarget | undefined {
	const { activity, status } = session;
	if (
		status === "done" ||
		activity?.kind !== "backlog" ||
		activity.itemId == null
	) {
		return undefined;
	}
	return {
		itemId: activity.itemId,
		phase: activity.phase,
		totalPhases: activity.totalPhases,
	};
}
