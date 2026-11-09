import { useCallback, useEffect, useRef, useState } from "react";
import type { ConversationTarget } from "../../../../../shared/sessionConversationTarget";
import { apiFetch } from "../../../apiFetch";
import { reportCaughtError } from "../../../clientFailures/reportCaughtError";
import { useApiNode } from "../../../useApiNode";
import { withNode } from "../../../withNode";
import { diffQuery } from "../../diffQuery";

const POLL_INTERVAL_MS = 5000;

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
		let cancelled = false;
		setState({ diff: "", loading: true, error: false });
		const poll = async () => {
			try {
				const res = await apiFetch(withNode(`/api/diff?${query}`, node));
				if (!res.ok) throw new Error(`HTTP ${res.status}`);
				const body = await res.text();
				if (!cancelled) setState({ diff: body, loading: false, error: false });
			} catch (error) {
				reportCaughtError(error, "diff");
				if (!cancelled) setState({ diff: "", loading: false, error: true });
			}
		};
		pollRef.current = poll;
		poll();
		const id = setInterval(poll, POLL_INTERVAL_MS);
		return () => {
			cancelled = true;
			clearInterval(id);
		};
	}, [cwd, query, node]);

	return { ...state, refresh: useCallback(() => pollRef.current(), []) };
}
