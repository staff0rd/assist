import { useCallback, useEffect, useState } from "react";
import type { TestflightTesters } from "../../../../../../../../testflight/TestflightTesters";
import { apiFetch } from "../../../../../apiFetch";

type TestersState = {
	loading: boolean;
	error?: string;
	testers?: TestflightTesters;
};

async function fetchTesters(): Promise<TestflightTesters> {
	const res = await apiFetch("/api/testflight/testers", {
		capture: false,
		timeoutMs: 60_000,
	});
	const body = await res.json();
	if (!res.ok) throw new Error(body.error ?? `Request failed (${res.status})`);
	return body;
}

export function useTestflightTesters() {
	const [state, setState] = useState<TestersState>({ loading: true });
	const refresh = useCallback(() => {
		setState((prev) => ({ ...prev, loading: true, error: undefined }));
		fetchTesters().then(
			(testers) => setState({ loading: false, testers }),
			(error: unknown) =>
				setState({
					loading: false,
					error: error instanceof Error ? error.message : String(error),
				}),
		);
	}, []);
	useEffect(refresh, [refresh]);
	return { ...state, refresh };
}
