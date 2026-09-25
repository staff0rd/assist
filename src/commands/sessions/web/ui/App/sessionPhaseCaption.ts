import type { SessionInfo } from "../types";

export function sessionPhaseCaption(session: SessionInfo): string | undefined {
	const { activity, status } = session;
	const phaseName =
		activity?.kind === "backlog" && status !== "done"
			? activity.phaseName
			: undefined;
	return phaseName ?? session.subtitle;
}
