import { useEffect, useState } from "react";
import type { ReleaseStreamState } from "../../../releases/types";

type ReleasesStateView = {
	streams: ReleaseStreamState[];
	loading: boolean;
	error: string | null;
};

const LOADING: ReleasesStateView = {
	streams: [],
	loading: true,
	error: null,
};

async function fetchStreams(cwd: string): Promise<ReleaseStreamState[]> {
	const res = await fetch(`/api/releases/state?cwd=${encodeURIComponent(cwd)}`);
	const body = await res.json();
	if (!res.ok) throw new Error(body?.error ?? `HTTP ${res.status}`);
	return body.streams ?? [];
}

export function useReleasesState(cwd: string): ReleasesStateView {
	const [state, setState] = useState<ReleasesStateView>(LOADING);

	useEffect(() => {
		if (!cwd) {
			setState({ streams: [], loading: false, error: "No repo selected." });
			return;
		}
		let cancelled = false;
		setState(LOADING);
		fetchStreams(cwd)
			.then((streams) => {
				if (!cancelled) setState({ streams, loading: false, error: null });
			})
			.catch((error: unknown) => {
				if (cancelled) return;
				setState({
					streams: [],
					loading: false,
					error:
						error instanceof Error
							? error.message
							: "Failed to load release state.",
				});
			});
		return () => {
			cancelled = true;
		};
	}, [cwd]);

	return state;
}
