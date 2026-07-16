import { useCallback, useEffect, useRef, useState } from "react";
import type { SessionInfo } from "./types";
import type { SuccessNotice } from "./useNotices";
import { RELOAD_FLAG, useReloadNotice } from "./useReloadNotice";

function isDoneUpdateSession(s: SessionInfo): boolean {
	return (
		s.commandType === "assist" &&
		s.assistArgs?.[0] === "update" &&
		s.status === "done"
	);
}

export function useUpdateReload(
	sessions: SessionInfo[],
	reconnecting: boolean,
	setSuccess: (notice: SuccessNotice) => void,
) {
	const [armed, setArmed] = useState(false);
	const sawDisconnect = useRef(false);
	const reloadedRef = useRef(false);
	const sessionsRef = useRef(sessions);
	sessionsRef.current = sessions;
	const preArmedDoneIds = useRef<Set<string>>(new Set());

	const armUpdateReload = useCallback(() => {
		sawDisconnect.current = false;
		preArmedDoneIds.current = new Set(
			sessionsRef.current.filter(isDoneUpdateSession).map((s) => s.id),
		);
		setArmed(true);
	}, []);

	useReloadNotice(setSuccess);

	useEffect(() => {
		if (!armed) return;
		if (reconnecting) {
			sawDisconnect.current = true;
			return;
		}
		if (reloadedRef.current || !sawDisconnect.current) return;
		const completedNew = sessions.some(
			(s) => isDoneUpdateSession(s) && !preArmedDoneIds.current.has(s.id),
		);
		if (completedNew) {
			reloadedRef.current = true;
			globalThis.sessionStorage?.setItem(RELOAD_FLAG, "1");
			globalThis.location.reload();
		}
	}, [armed, reconnecting, sessions]);

	return { armUpdateReload };
}
