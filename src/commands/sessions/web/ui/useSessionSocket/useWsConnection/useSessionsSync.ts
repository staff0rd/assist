import { useCallback, useState } from "react";
import type { SessionInfo } from "../../types";

export function useSessionsSync(syncSessions: (next: SessionInfo[]) => void) {
	const [sessions, setSessions] = useState<SessionInfo[]>([]);
	const [sessionsLoaded, setSessionsLoaded] = useState(false);
	const handleSessions = useCallback(
		(next: SessionInfo[]) => {
			syncSessions(next);
			setSessions(next);
			setSessionsLoaded(true);
		},
		[syncSessions],
	);
	return { sessions, sessionsLoaded, handleSessions };
}
