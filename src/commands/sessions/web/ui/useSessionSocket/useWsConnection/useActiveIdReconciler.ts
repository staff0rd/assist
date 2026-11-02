import { type Dispatch, type SetStateAction, useEffect, useRef } from "react";
import { reconcileActiveId } from "./useActiveIdReconciler/reconcileActiveId";
import type { SessionInfo } from "../../types";
import { useRouteDeselectsSession } from "../../useRouteDeselectsSession";

export function useActiveIdReconciler(
	sessions: SessionInfo[],
	setActiveId: Dispatch<SetStateAction<string | null>>,
	daemonActiveId: string | null,
) {
	const deselects = useRouteDeselectsSession();
	const previousRef = useRef<SessionInfo[]>([]);
	useEffect(() => {
		const previous = previousRef.current;
		previousRef.current = sessions;
		if (deselects) {
			setActiveId(null);
			return;
		}
		setActiveId((current) =>
			reconcileActiveId(sessions, current, daemonActiveId, previous),
		);
	}, [sessions, setActiveId, daemonActiveId, deselects]);
}
