import { useEffect, useReducer } from "react";
import type { Notices } from "../nodeUpdates/useUpdateActions/useNotices";
import { RESTART_GRACE_MS, restartingNodes } from "./restartingNodes";

/** Restarting nodes still in their grace period, re-rendering as each expires. */
export function useRestartingNodes({
	busy,
	busySince,
}: Pick<Notices, "busy" | "busySince">): Set<string> {
	const [, expire] = useReducer((n: number) => n + 1, 0);
	const now = Date.now();
	const restarting = restartingNodes(busy, busySince, now);
	const nextExpiry = Math.min(
		...[...restarting].map((name) => busySince[name] + RESTART_GRACE_MS),
	);
	useEffect(() => {
		if (!Number.isFinite(nextExpiry)) return;
		const timer = setTimeout(expire, Math.max(0, nextExpiry - Date.now()));
		return () => clearTimeout(timer);
	}, [nextExpiry]);
	return restarting;
}
