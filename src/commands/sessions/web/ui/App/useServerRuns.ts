import { useEffect, useState } from "react";
import type { ServerRunInfo } from "../../handleServerRuns";
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
		fetch(withNode(`/api/server-runs?cwd=${encodeURIComponent(cwd)}`, node))
			.then((res) => res.json())
			.then((body) => {
				if (!cancelled) setRuns(Array.isArray(body?.runs) ? body.runs : []);
			})
			.catch(() => {
				if (!cancelled) setRuns([]);
			});
		return () => {
			cancelled = true;
		};
	}, [cwd, node]);

	return runs;
}
