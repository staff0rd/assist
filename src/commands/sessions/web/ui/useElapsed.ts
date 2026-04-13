import { useEffect, useState } from "react";

export function useElapsed(startedAt: number): string {
	const [, tick] = useState(0);
	useEffect(() => {
		const id = setInterval(() => tick((n) => n + 1), 1000);
		return () => clearInterval(id);
	}, []);

	const secs = Math.floor((Date.now() - startedAt) / 1000);
	const m = Math.floor(secs / 60);
	const s = secs % 60;
	if (m >= 60) {
		const h = Math.floor(m / 60);
		return `${h}h ${m % 60}m`;
	}
	return m > 0 ? `${m}m ${s}s` : `${s}s`;
}
