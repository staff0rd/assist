import { sessionType } from "./sessionType";
import type { SessionInfo } from "../../../types";

export type SessionToggle = {
	key: "autoRun" | "autoAdvance";
	label: string;
	checked: boolean;
	caption?: string;
};

export function sessionToggles(session: SessionInfo): SessionToggle[] {
	const toggles: SessionToggle[] = [];
	const type = sessionType(session);

	if (type === "draft" || type === "bug" || type === "refine") {
		const checked = session.autoRun ?? false;
		toggles.push({
			key: "autoRun",
			label: "Auto-run",
			checked,
			...(checked ? { caption: "will auto-run" } : {}),
		});
	}

	const { activity } = session;
	if (activity?.kind === "backlog") {
		const inReviewPhase =
			activity.phase !== undefined && activity.phase === activity.totalPhases;
		const checked = session.autoAdvance ?? true;
		toggles.push({
			key: "autoAdvance",
			label: inReviewPhase ? "Dismiss" : "Continue",
			checked,
			...advanceCaption(inReviewPhase, checked),
		});
	}

	return toggles;
}

function advanceCaption(
	inReviewPhase: boolean,
	checked: boolean,
): { caption?: string } {
	if (inReviewPhase) return checked ? { caption: "will dismiss" } : {};
	return checked ? {} : { caption: "won't continue" };
}
