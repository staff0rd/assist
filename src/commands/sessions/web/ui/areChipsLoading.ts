import type { SessionInfo } from "./types";

export function areChipsLoading(
	session: SessionInfo,
	loading: boolean,
): boolean {
	if (loading) return true;
	const awaitingActivity =
		session.commandType === "assist" && session.activity === undefined;
	const finished = session.status === "done" || session.status === "error";
	return awaitingActivity && !finished;
}
