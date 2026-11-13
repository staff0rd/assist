import { useEffect, useState } from "react";
import type { LeftoverReport } from "../../../../../shared/LeftoverReport";
import { apiFetch } from "../../../apiFetch";
import { reportCaughtError } from "../../../clientFailures/reportCaughtError";
import { withNode } from "../../../withNode";

/** The targeted node's leftover workspaces, refetched each time the menu opens;
 * undefined until loaded or when the node cannot answer. */
export function useLeftoverReport(
	peer: string | undefined,
	open: boolean,
): LeftoverReport | undefined {
	const [report, setReport] = useState<LeftoverReport>();

	useEffect(() => {
		if (!open) return;
		let cancelled = false;
		void (async () => {
			try {
				const res = await apiFetch(withNode("/api/leftovers", peer));
				const body = res.ok ? await res.json() : undefined;
				if (!cancelled)
					setReport(Array.isArray(body?.leftovers) ? body : undefined);
			} catch (error) {
				reportCaughtError(error, "leftover workspaces");
				if (!cancelled) setReport(undefined);
			}
		})();
		return () => {
			cancelled = true;
		};
	}, [peer, open]);

	return report;
}
