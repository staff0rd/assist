import { useCallback, useEffect, useRef, useState } from "react";
import type { ConversationTarget } from "../../../../../shared/sessionConversationTarget";
import { apiFetch } from "../../../apiFetch";
import { reportCaughtError } from "../../../clientFailures/reportCaughtError";
import { startSerialPolling } from "../../../startSerialPolling";
import { useApiNode } from "../../../useApiNode";
import { withNode } from "../../../withNode";
import { diffQuery } from "../../diffQuery";

type DiffState = {
	diff: string;
	loading: boolean;
	error: boolean;
};

export function useDiff(
	cwd: string,
	conversation?: ConversationTarget,
	scope?: string,
): DiffState & { refresh: () => void } {
	const query = diffQuery(cwd, conversation, scope);
	const [state, setState] = useState<DiffState>({
		diff: "",
		loading: true,
		error: false,
	});
	const pollRef = useRef<() => void>(() => {});
	const node = useApiNode();

	useEffect(() => {
		if (!cwd) {
			setState({ diff: "", loading: false, error: false });
			return;
		}
		setState({ diff: "", loading: true, error: false });
		const polling = startSerialPolling(async (signal) => {
			try {
				const res = await apiFetch(withNode(`/api/diff?${query}`, node), {
					signal,
				});
				if (!res.ok) throw new Error(`HTTP ${res.status}`);
				const body = await res.text();
				if (!signal.aborted)
					setState({ diff: body, loading: false, error: false });
				return { failed: false };
			} catch (error) {
				if (signal.aborted) return undefined;
				reportCaughtError(error, "diff");
				setState({ diff: "", loading: false, error: true });
				return { failed: true };
			}
		});
		pollRef.current = polling.poll;
		return polling.stop;
	}, [cwd, query, node]);

	return { ...state, refresh: useCallback(() => pollRef.current(), []) };
}
