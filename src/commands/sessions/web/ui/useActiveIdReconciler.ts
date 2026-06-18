import { type Dispatch, type SetStateAction, useEffect } from "react";
import { reconcileActiveId } from "./reconcileActiveId";
import type { SessionInfo } from "./types";

export function useActiveIdReconciler(
	sessions: SessionInfo[],
	setActiveId: Dispatch<SetStateAction<string | null>>,
	daemonActiveId: string | null,
) {
	useEffect(() => {
		setActiveId((current) =>
			reconcileActiveId(sessions, current, daemonActiveId),
		);
	}, [sessions, setActiveId, daemonActiveId]);
}
