import { type Activity } from "../../../shared/emitActivity";
import type { Session } from "./createSession";

/* why: when a backlog run enters its auto-appended review (last) phase, flip
 * "Continue" off so the run pauses for human review at "done" (#409). Only on
 * the transition in — once flipped, later activity writes don't re-force it, so
 * the user can switch it back on during review. A rewind back to an earlier
 * phase clears the flag, so a later re-entry into review flips it off again. */
export function applyReviewPause(session: Session, activity: Activity): void {
	const inReview =
		activity.kind === "backlog" &&
		activity.phase !== undefined &&
		activity.phase === activity.totalPhases;
	if (inReview && !session.reviewStarted) {
		session.autoAdvance = false;
		session.reviewStarted = true;
	} else if (!inReview && session.reviewStarted) {
		session.reviewStarted = false;
	}
}
