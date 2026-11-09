import { useCallback, useEffect, useState } from "react";
import type { TestflightTesters } from "../../../../../../../../testflight/TestflightTesters";
import { testflightJson } from "./testflightJson";

type TestersState = {
	loading: boolean;
	error?: string;
	testers?: TestflightTesters;
};

const fetchTesters = () => testflightJson<TestflightTesters>();

export function useTestflightTesters() {
	const [state, setState] = useState<TestersState>({ loading: true });
	const refresh = useCallback((silent = false) => {
		if (!silent)
			setState((prev) => ({ ...prev, loading: true, error: undefined }));
		return fetchTesters().then(
			(testers) => setState({ loading: false, testers }),
			(error: unknown) =>
				setState({
					loading: false,
					error: error instanceof Error ? error.message : String(error),
				}),
		);
	}, []);
	useEffect(() => {
		void refresh();
	}, [refresh]);
	return { ...state, refresh };
}
