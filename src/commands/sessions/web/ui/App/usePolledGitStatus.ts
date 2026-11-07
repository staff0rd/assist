import { useCallback, useEffect, useRef, useState } from "react";
import type { ItemStatusCounts } from "../../gitStatus";
import { createProxyBlipGate } from "../createProxyBlipGate";
import { useApiNode } from "../useApiNode";
import { withNode } from "../withNode";
import { diffQuery } from "./diffQuery";
import { fetchGitStatusCounts } from "./fetchGitStatusCounts";

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
		const blipGate = createProxyBlipGate();
		const path = withNode(`/api/git-status?${diffQuery(cwd, sessionId)}`, node);
		const poll = async () => {
			const polled = await fetchGitStatusCounts(path, blipGate);
			if (polled && !cancelled) setCounts(polled.counts);
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
