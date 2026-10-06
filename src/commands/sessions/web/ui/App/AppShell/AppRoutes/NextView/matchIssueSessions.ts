import type { SessionInfo } from "../../../../types";
import { sessionRepo } from "./sessionRepo";
import type { TrackedIssues } from "./useTrackedIssues";

export function matchIssueSessions(
	sessions: SessionInfo[],
	trackedIssues: TrackedIssues,
	repo: string,
	number: number,
): SessionInfo[] {
	const key = repo.toLowerCase();
	const issue = `${key}#${number}`;
	return sessions.filter(
		(session) =>
			sessionRepo(session) === key &&
			(session.promptIssue?.toLowerCase() === issue ||
				trackedIssues.get(session.id)?.toLowerCase() === issue),
	);
}
