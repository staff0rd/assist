import { type Activity } from "../../../shared/emitActivity";
import type { Session } from "./createSession";

export function applyReviewPause(session: Session, activity: Activity): void {
	const inReview =
		activity.kind === "backlog" &&
		activity.phase !== undefined &&
		activity.phase === activity.totalPhases;
	if (inReview && !session.reviewStarted) {
		session.reviewStarted = true;
	} else if (!inReview && session.reviewStarted) {
		session.reviewStarted = false;
	}
}
