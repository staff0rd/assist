import { useCallback, useEffect, useRef, useState } from "react";
import type { ItemStatusCounts } from "../../gitStatus";
import { apiFetch } from "../apiFetch";
import { reportCaughtError } from "../clientFailures/reportCaughtError";
import { useApiNode } from "../useApiNode";
import { withNode } from "../withNode";
import { diffQuery } from "./diffQuery";

const POLL_INTERVAL_MS = 5000;

export function usePolledGitStatus(
	cwd: string,
	sessionId?: string,
	enabled = true,
): { counts: ItemStatusCounts | null; refresh: () => void } {
	const [counts, setCounts] = useState<ItemStatusCounts | null>(null);
	const pollRef = useRef<() => void>(() => {});
	const node = useApiNode();

	useEffect(() => {
		pollRef.current = () => {};
		if (!cwd || !enabled) {
			setCounts(null);
			return;
		}
		let cancelled = false;
		const poll = async () => {
			try {
				const res = await apiFetch(
					withNode(`/api/git-status?${diffQuery(cwd, sessionId)}`, node),
				);
				if (!res.ok) {
					if (!cancelled) setCounts(null);
					return;
				}
				const parsed = await res.json().then(
					(body: ItemStatusCounts | null) => ({ body }),
					() => undefined,
				);
				if (!parsed || cancelled) return;
				setCounts(parsed.body ?? null);
			} catch (error) {
				reportCaughtError(error, "git status counts");
				if (!cancelled) setCounts(null);
			}
		};
		pollRef.current = poll;
		poll();
		const id = setInterval(poll, POLL_INTERVAL_MS);
		return () => {
			cancelled = true;
			clearInterval(id);
		};
	}, [cwd, sessionId, node, enabled]);

	return { counts, refresh: useCallback(() => pollRef.current(), []) };
}
