import { useEffect, useRef, useState } from "react";
import type { SessionStatus } from "./types";

export function useElapsed(startedAt: number, status: SessionStatus): string {
	const [, tick] = useState(0);
	const isDone = status === "done";

	useEffect(() => {
		if (isDone) return;
		const id = setInterval(() => tick((n) => n + 1), 1000);
		return () => clearInterval(id);
	}, [isDone]);

	const frozenMs = useRef<number | null>(null);
	if (isDone) {
		frozenMs.current ??= Date.now() - startedAt;
	} else {
		frozenMs.current = null;
	}

	const secs = Math.floor((frozenMs.current ?? Date.now() - startedAt) / 1000);
	const m = Math.floor(secs / 60);
	const s = secs % 60;
	if (m >= 60) {
		const h = Math.floor(m / 60);
		return `${h}h ${m % 60}m`;
	}
	return m > 0 ? `${m}m ${s}s` : `${s}s`;
}
