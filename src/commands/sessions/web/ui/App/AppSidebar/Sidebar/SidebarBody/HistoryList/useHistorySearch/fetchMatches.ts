import { apiFetch } from "../../../../../../apiFetch";
import type { HistoricalSession } from "../../../../../../types";
import { withNode } from "../../../../../../withNode";

export async function fetchMatches(
	cwd: string,
	query: string,
	node: string | undefined,
	signal: AbortSignal,
): Promise<HistoricalSession[]> {
	const res = await apiFetch(
		withNode(
			`/api/history/search?cwd=${encodeURIComponent(cwd)}&q=${encodeURIComponent(query)}`,
			node,
		),
		{ signal },
	);
	const body = await res.json().catch(() => ({}));
	if (!res.ok) throw new Error(body.error ?? `HTTP ${res.status}`);
	const sessions: HistoricalSession[] = Array.isArray(body.sessions)
		? body.sessions
		: [];
	return node ? sessions.map((s) => ({ ...s, node })) : sessions;
}
