import { sessionType } from "./sessionType";
import type { SessionInfo } from "../types";

export type SessionToggle = {
	key: "autoApprove" | "autoAdvance";
	label: string;
	checked: boolean;
	caption?: string;
};

export function sessionToggles(session: SessionInfo): SessionToggle[] {
	const toggles: SessionToggle[] = [];
	const type = sessionType(session);

	if (type === "draft" || type === "bug" || type === "refine") {
		const checked = session.autoApprove ?? false;
		toggles.push({
			key: "autoApprove",
			label: "Auto approve & start",
			checked,
			...(checked ? { caption: "will approve & start" } : {}),
		});
	}

	const { activity } = session;
	if (activity?.kind === "backlog") {
		const inReviewPhase =
			activity.phase !== undefined && activity.phase === activity.totalPhases;
		const checked = session.autoAdvance ?? true;
		if (!inReviewPhase)
			toggles.push({
				key: "autoAdvance",
				label: "Continue",
				checked,
				...(checked ? {} : { caption: "won't continue" }),
			});
	}

	return toggles;
}
