import { useCallback, useEffect, useRef } from "react";
import type { SessionInfo } from "../../types";

/** After a transfer, move the selection from the source to the new session once it is listed — only if the source was selected. */
export function useTransferHandoff(
	sessions: SessionInfo[],
	getActiveId: () => string | null,
	setActiveId: (id: string) => void,
) {
	const pendingRef = useRef<string | null>(null);
	const sessionsRef = useRef(sessions);
	sessionsRef.current = sessions;

	const selectIfListed = useCallback(
		(list: SessionInfo[]) => {
			const pending = pendingRef.current;
			if (!pending || !list.some((s) => s.id === pending)) return;
			pendingRef.current = null;
			setActiveId(pending);
		},
		[setActiveId],
	);

	const handoffTransfer = useCallback(
		(sourceId: string, sessionId: string) => {
			if (getActiveId() !== sourceId) return;
			pendingRef.current = sessionId;
			selectIfListed(sessionsRef.current);
		},
		[getActiveId, selectIfListed],
	);

	useEffect(() => selectIfListed(sessions), [sessions, selectIfListed]);

	return { handoffTransfer };
}
