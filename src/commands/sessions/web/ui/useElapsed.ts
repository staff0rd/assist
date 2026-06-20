import { useEffect, useState } from "react";

export function useElapsed(
	runningMs = 0,
	runningSince: number | null = null,
): string {
	const [, tick] = useState(0);

	useEffect(() => {
		if (runningSince == null) return;
		const id = setInterval(() => tick((n) => n + 1), 1000);
		return () => clearInterval(id);
	}, [runningSince]);

	const totalMs =
		runningSince == null ? runningMs : runningMs + (Date.now() - runningSince);
	const secs = Math.floor(totalMs / 1000);
	const m = Math.floor(secs / 60);
	const s = secs % 60;
	if (m >= 60) {
		const h = Math.floor(m / 60);
		return `${h}h ${m % 60}m`;
	}
	return m > 0 ? `${m}m ${s}s` : `${s}s`;
}
