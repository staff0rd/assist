import { useEffect, useState } from "react";
import type { SessionInfo } from "../../../../types";
import { useApiNode } from "../../../../useApiNode";
import { loadItemTrackers } from "../../../loadItemTrackers";

export type TrackedIssues = ReadonlyMap<string, string>;

type ItemSession = [id: string, cwd: string | undefined, itemId: number];

export function useTrackedIssues(sessions: SessionInfo[]): TrackedIssues {
	const node = useApiNode();
	const [tracked, setTracked] = useState<TrackedIssues>(() => new Map());
	const itemSessionsKey = JSON.stringify(
		sessions.flatMap((session): ItemSession[] => {
			const itemId = session.activity?.itemId;
			return itemId == null ? [] : [[session.id, session.cwd, itemId]];
		}),
	);

	useEffect(() => {
		let cancelled = false;
		const itemSessions = JSON.parse(itemSessionsKey) as ItemSession[];
		Promise.all(
			itemSessions.map(async ([id, cwd, itemId]) => {
				const trackers = await loadItemTrackers(cwd ?? undefined, node);
				const issue = trackers.get(itemId)?.githubIssue;
				return issue ? ([id, issue] as const) : undefined;
			}),
		).then((entries) => {
			if (!cancelled)
				setTracked(new Map(entries.filter((entry) => entry !== undefined)));
		});
		return () => {
			cancelled = true;
		};
	}, [itemSessionsKey, node]);

	return tracked;
}
