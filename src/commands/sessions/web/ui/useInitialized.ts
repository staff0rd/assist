import { useCallback, useRef, useState } from "react";
import { removeIds } from "./removeIds";
import { respawnedIds } from "./respawnedIds";
import type { SessionInfo } from "./types";

export function useInitialized() {
	const [initialized, setInitialized] = useState<Set<string>>(new Set());
	const startedAt = useRef(new Map<string, number>());

	const markInitialized = useCallback((id: string) => {
		setInitialized((prev) => (prev.has(id) ? prev : new Set(prev).add(id)));
	}, []);

	const syncSessions = useCallback((sessions: SessionInfo[]) => {
		const respawned = respawnedIds(startedAt.current, sessions);
		startedAt.current = new Map(sessions.map((s) => [s.id, s.startedAt]));
		if (respawned.length) setInitialized((prev) => removeIds(prev, respawned));
	}, []);

	return { initialized, markInitialized, syncSessions };
}
