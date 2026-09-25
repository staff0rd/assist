import { type Dispatch, type SetStateAction, useEffect } from "react";
import { reconcileActiveId } from "./useActiveIdReconciler/reconcileActiveId";
import type { SessionInfo } from "../../types";
import { useRouteDeselectsSession } from "../../useRouteDeselectsSession";

export function useActiveIdReconciler(
	sessions: SessionInfo[],
	setActiveId: Dispatch<SetStateAction<string | null>>,
	daemonActiveId: string | null,
) {
	const deselects = useRouteDeselectsSession();
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
