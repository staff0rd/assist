import type { HistoricalSession } from "../../../../types";
import { uniqueRepos } from "./uniqueRepos";

export function linkedNodeRepos(
	history: HistoricalSession[],
): Record<string, string[]> {
	const byNode = new Map<string, HistoricalSession[]>();
	for (const session of history) {
		if (!session.node) continue;
		byNode.set(session.node, [...(byNode.get(session.node) ?? []), session]);
	}
	return Object.fromEntries(
		[...byNode].map(([node, sessions]) => [node, uniqueRepos("", sessions)]),
	);
}
