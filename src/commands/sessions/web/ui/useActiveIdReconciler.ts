import { type Dispatch, type SetStateAction, useEffect } from "react";
import { useLocation } from "react-router";
import { reconcileActiveId } from "./reconcileActiveId";
import type { SessionInfo } from "./types";

export function useActiveIdReconciler(
	sessions: SessionInfo[],
	setActiveId: Dispatch<SetStateAction<string | null>>,
	daemonActiveId: string | null,
) {
	const pathname = useLocation().pathname;
	const deselects =
		pathname.startsWith("/backlog") || pathname.startsWith("/usage");
	useEffect(() => {
		if (deselects) {
			setActiveId(null);
			return;
		}
		setActiveId((current) =>
			reconcileActiveId(sessions, current, daemonActiveId),
		);
	}, [sessions, setActiveId, daemonActiveId, deselects]);
}
