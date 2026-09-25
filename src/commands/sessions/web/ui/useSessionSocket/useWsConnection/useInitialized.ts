import { useCallback, useEffect, useRef, useState } from "react";
import { removeIds } from "./useInitialized/removeIds";
import { respawnedIds } from "./useInitialized/respawnedIds";
import { startedRunIds } from "./useInitialized/startedRunIds";
import type { SessionInfo } from "../../types";

/* why: a run/server process may print nothing after (re)spawning, so its first
 * output byte can't be relied on to clear the "Starting session…" overlay. */
export const RUN_SETTLE_MS = 1500;

export function useInitialized() {
	const [initialized, setInitialized] = useState<Set<string>>(new Set());
	const startedAt = useRef(new Map<string, number>());
	const settleTimers = useRef(new Map<string, ReturnType<typeof setTimeout>>());

	const markInitialized = useCallback((id: string) => {
		setInitialized((prev) => (prev.has(id) ? prev : new Set(prev).add(id)));
	}, []);

	const settleAfterDelay = useCallback(
		(ids: string[]) => {
			const timers = settleTimers.current;
			for (const id of ids) {
				clearTimeout(timers.get(id));
				timers.set(
					id,
					setTimeout(() => {
						timers.delete(id);
						markInitialized(id);
					}, RUN_SETTLE_MS),
				);
			}
		},
		[markInitialized],
	);

	useEffect(() => {
		const timers = settleTimers.current;
		return () => {
			for (const t of timers.values()) clearTimeout(t);
		};
	}, []);

	const syncSessions = useCallback(
		(sessions: SessionInfo[]) => {
			const respawned = respawnedIds(startedAt.current, sessions);
			const startedRuns = startedRunIds(startedAt.current, sessions);
			startedAt.current = new Map(sessions.map((s) => [s.id, s.startedAt]));
			if (respawned.length)
				setInitialized((prev) => removeIds(prev, respawned));
			settleAfterDelay(startedRuns);
		},
		[settleAfterDelay],
	);

	return { initialized, markInitialized, syncSessions };
}
