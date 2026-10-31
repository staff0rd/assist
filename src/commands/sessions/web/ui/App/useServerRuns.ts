import { useEffect, useState } from "react";
import type { ServerRunInfo } from "../../handleServerRuns";
import { apiFetch } from "../apiFetch";
import { reportCaughtError } from "../clientFailures/reportCaughtError";
import { useApiNode } from "../useApiNode";
import { withNode } from "../withNode";

export function useServerRuns(cwd: string | undefined): ServerRunInfo[] {
	const [runs, setRuns] = useState<ServerRunInfo[]>([]);
	const node = useApiNode();

	useEffect(() => {
		if (!cwd) {
			setRuns([]);
			return;
		}
		let cancelled = false;
		apiFetch(withNode(`/api/server-runs?cwd=${encodeURIComponent(cwd)}`, node))
			.then((res) => res.json())
			.then((body) => {
				if (!cancelled) setRuns(Array.isArray(body?.runs) ? body.runs : []);
			})
			.catch((error: unknown) => {
				reportCaughtError(error, "server runs");
				if (!cancelled) setRuns([]);
			});
		return () => {
			cancelled = true;
		};
	}, [cwd, node]);

	return runs;
}
