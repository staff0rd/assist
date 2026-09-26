import { useEffect, useState } from "react";
import type { ItemStatusCounts } from "../../../gitStatus";
import { useApiNode } from "../../useApiNode";
import { withNode } from "../../withNode";
import { diffQuery } from "../diffQuery";

const POLL_INTERVAL_MS = 5000;

export function useGitStatusCounts(
	cwd: string,
	sessionId?: string,
): ItemStatusCounts | null {
	const [counts, setCounts] = useState<ItemStatusCounts | null>(null);
	const node = useApiNode();

	useEffect(() => {
		if (!cwd) {
			setCounts(null);
			return;
		}
		let cancelled = false;
		const poll = async () => {
			try {
				const res = await fetch(
					withNode(`/api/git-status?${diffQuery(cwd, sessionId)}`, node),
				);
				const body = await res.json();
				if (!cancelled) setCounts(body ?? null);
			} catch {
				if (!cancelled) setCounts(null);
			}
		};
		poll();
		const id = setInterval(poll, POLL_INTERVAL_MS);
		return () => {
			cancelled = true;
			clearInterval(id);
		};
	}, [cwd, sessionId, node]);

	return counts;
}
