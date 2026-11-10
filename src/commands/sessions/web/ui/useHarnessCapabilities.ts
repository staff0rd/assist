import { useEffect, useState } from "react";
import { apiFetch } from "./apiFetch";
import {
	type HarnessCapabilities,
	noHarnessCapabilities,
	parseHarnessCapabilities,
} from "./parseHarnessCapabilities";
import { reportCaughtError } from "./clientFailures/reportCaughtError";
import { withNode } from "./withNode";

export function useHarnessCapabilities(node?: string): HarnessCapabilities {
	const [capabilities, setCapabilities] = useState(noHarnessCapabilities);

	useEffect(() => {
		let cancelled = false;
		void (async () => {
			try {
				const res = await apiFetch(withNode("/api/harness", node));
				const body = await res.json();
				if (!cancelled) setCapabilities(parseHarnessCapabilities(body));
			} catch (error) {
				reportCaughtError(error, "harness capabilities");
				if (!cancelled) setCapabilities(noHarnessCapabilities);
			}
		})();
		return () => {
			cancelled = true;
		};
	}, [node]);

	return capabilities;
}
