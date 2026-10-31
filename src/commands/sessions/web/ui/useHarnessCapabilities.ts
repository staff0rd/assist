import { useEffect, useState } from "react";
import { apiFetch } from "./apiFetch";
import { reportCaughtError } from "./clientFailures/reportCaughtError";

export function useHarnessCapabilities(): {
	exposeCodexActions: boolean;
	exposePiActions: boolean;
} {
	const [exposeCodexActions, setExposeCodexActions] = useState(false);
	const [exposePiActions, setExposePiActions] = useState(false);

	useEffect(() => {
		let cancelled = false;
		void (async () => {
			try {
				const res = await apiFetch("/api/harness");
				const body = await res.json();
				if (!cancelled) {
					setExposeCodexActions(Boolean(body?.exposeCodexActions));
					setExposePiActions(Boolean(body?.exposePiActions));
				}
			} catch (error) {
				reportCaughtError(error, "harness capabilities");
				setExposeCodexActions(false);
				setExposePiActions(false);
			}
		})();
		return () => {
			cancelled = true;
		};
	}, []);

	return { exposeCodexActions, exposePiActions };
}
