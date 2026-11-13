import { useCallback, useEffect, useRef, useState } from "react";
import type { ConversationTarget } from "../../../shared/sessionConversationTarget";
import type { ItemStatusCounts } from "../../gitStatus";
import { useApiNode } from "../useApiNode";
import { withNode } from "../withNode";
import { diffQuery } from "./diffQuery";
import { startGitStatusPolling } from "./startGitStatusPolling";

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
		const polling = startGitStatusPolling(
			withNode(`/api/git-status?${query}`, node),
			setCounts,
		);
		pollRef.current = polling.poll;
		return polling.stop;
	}, [cwd, query, node, enabled]);

	return { counts, refresh: useCallback(() => pollRef.current(), []) };
}
