import { useCallback } from "react";
import type { SessionInfo } from "./types";

export function useSessionsSync(
	syncSessions: (next: SessionInfo[]) => void,
	setSessions: (next: SessionInfo[]) => void,
) {
	return useCallback(
		(next: SessionInfo[]) => {
			syncSessions(next);
			setSessions(next);
		},
		[syncSessions, setSessions],
	);
}
