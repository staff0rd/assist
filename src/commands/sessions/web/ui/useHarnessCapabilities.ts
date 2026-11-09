import { useEffect, useState } from "react";
import type { FeatureResolution } from "../../../../shared/harnessAdapters/types";
import type { HarnessKind } from "../../../../shared/harnesses";
import { apiFetch } from "./apiFetch";
import { reportCaughtError } from "./clientFailures/reportCaughtError";
import { withNode } from "./withNode";

export type HarnessCapabilities = {
	exposeCodexActions: boolean;
	exposePiActions: boolean;
	engine: HarnessKind;
	features: Record<string, Partial<Record<HarnessKind, FeatureResolution>>>;
};

const NONE: HarnessCapabilities = {
	exposeCodexActions: false,
	exposePiActions: false,
	engine: "claude",
	features: {},
};

export function useHarnessCapabilities(node?: string): HarnessCapabilities {
	const [capabilities, setCapabilities] = useState(NONE);

	useEffect(() => {
		let cancelled = false;
		void (async () => {
			try {
				const res = await apiFetch(withNode("/api/harness", node));
				const body = await res.json();
				if (!cancelled)
					setCapabilities({
						exposeCodexActions: Boolean(body?.exposeCodexActions),
						exposePiActions: Boolean(body?.exposePiActions),
						engine: body?.engine ?? "claude",
						features: body?.features ?? {},
					});
			} catch (error) {
				reportCaughtError(error, "harness capabilities");
				if (!cancelled) setCapabilities(NONE);
			}
		})();
		return () => {
			cancelled = true;
		};
	}, [node]);

	return capabilities;
}
