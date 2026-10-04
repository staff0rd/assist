import { useCallback, useEffect, useRef, useState } from "react";
import type { SessionInfo } from "../../types";

function isDoneUpdateSession(s: SessionInfo): boolean {
	return (
		s.commandType === "assist" &&
		s.assistArgs?.[0] === "update" &&
		s.status === "done"
	);
}

export function useUpdateCompletion(
	sessions: SessionInfo[],
	disconnected: boolean,
	node?: string,
): { arm: () => void; completed: boolean } {
	const [armed, setArmed] = useState(false);
	const [completed, setCompleted] = useState(false);
	const sawDisconnect = useRef(false);
	const sessionsRef = useRef(sessions);
	sessionsRef.current = sessions;
	const preArmedDoneIds = useRef<Set<string>>(new Set());

	const arm = useCallback(() => {
		sawDisconnect.current = false;
		setCompleted(false);
		preArmedDoneIds.current = new Set(
			sessionsRef.current.filter(isDoneUpdateSession).map((s) => s.id),
		);
		setArmed(true);
	}, []);

	useEffect(() => {
		if (!armed || completed) return;
		if (disconnected) {
			sawDisconnect.current = true;
			return;
		}
		if (!sawDisconnect.current) return;
		const completedNew = sessions.some(
			(s) =>
				isDoneUpdateSession(s) &&
				s.node === node &&
				!preArmedDoneIds.current.has(s.id),
		);
		if (completedNew) setCompleted(true);
	}, [armed, completed, disconnected, sessions, node]);

	return { arm, completed };
}
