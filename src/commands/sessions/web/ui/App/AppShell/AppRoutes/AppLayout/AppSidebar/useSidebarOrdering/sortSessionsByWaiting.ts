import type { SessionInfo } from "../../../../../../types";

export function hasWaitedPastThreshold(
	session: SessionInfo,
	now: number,
	thresholdMs: number,
): boolean {
	return (
		session.status === "waiting" &&
		session.waitingSince != null &&
		now - session.waitingSince >= thresholdMs
	);
}

export function sortSessionsByWaiting(
	sessions: SessionInfo[],
	isStarred: (session: SessionInfo) => boolean,
	now: number,
	thresholdMs: number,
): SessionInfo[] {
	const unstarred = sessions.filter((s) => !isStarred(s));
	const floated = (s: SessionInfo) =>
		hasWaitedPastThreshold(s, now, thresholdMs);
	const longestWaitingFirst = unstarred
		.filter(floated)
		.sort((a, b) => (a.waitingSince ?? 0) - (b.waitingSince ?? 0));
	return [
		...sessions.filter((s) => isStarred(s)),
		...longestWaitingFirst,
		...unstarred.filter((s) => !floated(s)),
	];
}
