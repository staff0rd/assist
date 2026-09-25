import type { SessionInfo } from "./types";

export function startedRunIds(
	prevStartedAt: Map<string, number>,
	next: SessionInfo[],
): string[] {
	return next
		.filter(
			(s) => s.commandType === "run" && prevStartedAt.get(s.id) !== s.startedAt,
		)
		.map((s) => s.id);
}
