import { useEffect, useState } from "react";
import type { InboxScanRun } from "../types";

export function useRunElapsed(run: InboxScanRun): number {
	const [now, setNow] = useState(() => Date.now());
	const running = run.status === "scanning";
	useEffect(() => {
		if (!running) return;
		const timer = setInterval(() => setNow(Date.now()), 1000);
		return () => clearInterval(timer);
	}, [running]);
	const end = run.finishedAt ? Date.parse(run.finishedAt) : now;
	return Math.max(0, end - Date.parse(run.startedAt));
}
