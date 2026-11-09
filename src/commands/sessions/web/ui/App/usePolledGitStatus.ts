import { useCallback, useEffect, useRef, useState } from "react";
import type { ConversationTarget } from "../../../shared/sessionConversationTarget";
import type { ItemStatusCounts } from "../../gitStatus";
import { createProxyBlipGate } from "../createProxyBlipGate";
import { useApiNode } from "../useApiNode";
import { withNode } from "../withNode";
import { diffQuery } from "./diffQuery";
import { fetchGitStatusCounts } from "./fetchGitStatusCounts";

const POLL_INTERVAL_MS = 5000;

export function usePolledGitStatus(
	cwd: string,
	conversation?: ConversationTarget,
	enabled = true,
): { counts: ItemStatusCounts | null; refresh: () => void } {
	const [counts, setCounts] = useState<ItemStatusCounts | null>(null);
	const pollRef = useRef<() => void>(() => {});
	const node = useApiNode();
	const query = diffQuery(cwd, conversation);

	useEffect(() => {
		pollRef.current = () => {};
		if (!cwd || !enabled) {
			setCounts(null);
			return;
		}
		let cancelled = false;
		const blipGate = createProxyBlipGate();
		const path = withNode(`/api/git-status?${query}`, node);
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
	}, [cwd, query, node, enabled]);

	return { counts, refresh: useCallback(() => pollRef.current(), []) };
}
