import { type Dispatch, type SetStateAction, useEffect } from "react";
import { useLocation } from "react-router";
import { reconcileActiveId } from "./reconcileActiveId";
import type { SessionInfo } from "./types";

export function useActiveIdReconciler(
	sessions: SessionInfo[],
	setActiveId: Dispatch<SetStateAction<string | null>>,
	daemonActiveId: string | null,
) {
	const onBacklog = useLocation().pathname.startsWith("/backlog");
	useEffect(() => {
		if (onBacklog) {
			setActiveId(null);
			return;
		}
		setActiveId((current) =>
			reconcileActiveId(sessions, current, daemonActiveId),
		);
	}, [sessions, setActiveId, daemonActiveId, onBacklog]);
}
