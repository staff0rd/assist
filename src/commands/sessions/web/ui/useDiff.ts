import { useEffect, useState } from "react";

const POLL_INTERVAL_MS = 5000;

type DiffState = {
	diff: string;
	loading: boolean;
	error: boolean;
};

export function useDiff(cwd: string): DiffState {
	const [state, setState] = useState<DiffState>({
		diff: "",
		loading: true,
		error: false,
	});

	useEffect(() => {
		if (!cwd) {
			setState({ diff: "", loading: false, error: false });
			return;
		}
		let cancelled = false;
		setState({ diff: "", loading: true, error: false });
		const poll = async () => {
			try {
				const res = await fetch(`/api/diff?cwd=${encodeURIComponent(cwd)}`);
				if (!res.ok) throw new Error(`HTTP ${res.status}`);
				const body = await res.text();
				if (!cancelled) setState({ diff: body, loading: false, error: false });
			} catch {
				if (!cancelled) setState({ diff: "", loading: false, error: true });
			}
		};
		poll();
		const id = setInterval(poll, POLL_INTERVAL_MS);
		return () => {
			cancelled = true;
			clearInterval(id);
		};
	}, [cwd]);

	return state;
}
