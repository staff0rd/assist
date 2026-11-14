import { type DisplayStatus, displayStatus } from "../displayStatus";
import { isReviewPhase } from "../isReviewPhase";
import type { SessionInfo } from "../types";

type PhoneSessionGroups = {
	questions: SessionInfo[];
	needsYou: SessionInfo[];
	running: SessionInfo[];
	review: SessionInfo[];
	done: SessionInfo[];
};

const QUESTIONS = new Set<DisplayStatus>(["question", "design"]);
const NEEDS_YOU = new Set<DisplayStatus>(["check", "waiting", "error"]);

export function needsAttention(session: SessionInfo): boolean {
	const status = displayStatus(session);
	return QUESTIONS.has(status) || NEEDS_YOU.has(status);
}

export function groupSessionsByStatus(
	sessions: SessionInfo[],
): PhoneSessionGroups {
	const groups: PhoneSessionGroups = {
		questions: [],
		needsYou: [],
		running: [],
		review: [],
		done: [],
	};
	for (const session of sessions) {
		const status = displayStatus(session);
		const live = status === "running" || needsAttention(session);
		if (live && isReviewPhase(session)) groups.review.push(session);
		else if (QUESTIONS.has(status)) groups.questions.push(session);
		else if (NEEDS_YOU.has(status)) groups.needsYou.push(session);
		else if (status === "running") groups.running.push(session);
		else groups.done.push(session);
	}
	return groups;
}
