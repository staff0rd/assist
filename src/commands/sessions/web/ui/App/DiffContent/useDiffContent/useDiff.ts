import { useCallback, useEffect, useRef, useState } from "react";
import { diffQuery } from "../../diffQuery";

const POLL_INTERVAL_MS = 5000;

type DiffState = {
	diff: string;
	loading: boolean;
	error: boolean;
};

export function useDiff(
	cwd: string,
	sessionId?: string,
	scope?: string,
): DiffState & { refresh: () => void } {
	const [state, setState] = useState<DiffState>({
		diff: "",
		loading: true,
		error: false,
	});
	const pollRef = useRef<() => void>(() => {});

	useEffect(() => {
		if (!cwd) {
			setState({ diff: "", loading: false, error: false });
			return;
		}
		let cancelled = false;
		setState({ diff: "", loading: true, error: false });
		const poll = async () => {
			try {
				const res = await fetch(
					`/api/diff?${diffQuery(cwd, sessionId, scope)}`,
				);
				if (!res.ok) throw new Error(`HTTP ${res.status}`);
				const body = await res.text();
				if (!cancelled) setState({ diff: body, loading: false, error: false });
			} catch {
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
	}, [cwd, sessionId, scope]);

	return { ...state, refresh: useCallback(() => pollRef.current(), []) };
}
