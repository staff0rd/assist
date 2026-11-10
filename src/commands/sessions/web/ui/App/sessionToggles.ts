import { isReviewPhase } from "../isReviewPhase";
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
			label: "Auto start",
			checked,
			...(checked ? { caption: "will auto start" } : {}),
		});
	}

	if (session.activity?.kind === "backlog") {
		const checked = session.autoAdvance ?? true;
		if (!isReviewPhase(session))
			toggles.push({
				key: "autoAdvance",
				label: "Continue",
				checked,
				...(checked ? {} : { caption: "won't continue" }),
			});
	}

	return toggles;
}
