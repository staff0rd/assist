import { useEffect, useState } from "react";
import { apiFetch } from "../../../../../../apiFetch";
import { reportCaughtError } from "../../../../../../clientFailures/reportCaughtError";
import { withNode } from "../../../../../../withNode";
import type { NodeUpdateEntry } from "../../../../NodeUpdateEntry";

const POLL_MS = 3_000;
const NO_LINES: string[] = [];

function sameLines(a: string[], b: string[]): boolean {
	return a.length === b.length && a.every((line, i) => line === b[i]);
}

async function fetchHistory(
	name: string,
	local: boolean,
): Promise<string[] | null> {
	const res = await apiFetch(
		withNode("/api/updates/history", local ? undefined : name),
		{ timeoutMs: 10_000 },
	);
	if (!res.ok) return null;
	const body = (await res.json()) as { history?: unknown };
	return Array.isArray(body.history) ? (body.history as string[]) : null;
}

export function useLiveHistory(entry: NodeUpdateEntry): string[] {
	const snapshot = entry.status?.history ?? NO_LINES;
	const [lines, setLines] = useState(snapshot);
	const { name, local } = entry;

	useEffect(() => {
		setLines((prev) => (sameLines(prev, snapshot) ? prev : snapshot));
	}, [snapshot]);

	useEffect(() => {
		let cancelled = false;
		const poll = () =>
			fetchHistory(name, local)
				.then((next) => {
					if (cancelled || !next) return;
					setLines((prev) => (sameLines(prev, next) ? prev : next));
				})
				.catch((error: unknown) =>
					reportCaughtError(error, `watcher history (${name})`),
				);
		void poll();
		const id = setInterval(poll, POLL_MS);
		return () => {
			cancelled = true;
			clearInterval(id);
		};
	}, [name, local]);

	return lines;
}
