import type { SessionInfo } from "../../../../types";
import { reviewTargetPr } from "../../../reviewTargetPr";
import { sessionRepo } from "./sessionRepo";

export function matchPrSessions(
	sessions: SessionInfo[],
	repo: string,
	number: number,
): SessionInfo[] {
	const key = repo.toLowerCase();
	return sessions.filter(
		(session) =>
			reviewTargetPr(session) === number && sessionRepo(session) === key,
	);
}
