import { useEffect, useState } from "react";
import type { ServerRunInfo } from "../handleServerRuns";

export function useServerRuns(cwd: string | undefined): ServerRunInfo[] {
	const [runs, setRuns] = useState<ServerRunInfo[]>([]);

	useEffect(() => {
		if (!cwd) {
			setRuns([]);
			return;
		}
		let cancelled = false;
		fetch(`/api/server-runs?cwd=${encodeURIComponent(cwd)}`)
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
	}, [cwd]);

	return runs;
}
