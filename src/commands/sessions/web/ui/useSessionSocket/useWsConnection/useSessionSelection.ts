import type { Dispatch, SetStateAction } from "react";
import type { SessionInfo } from "../../types";
import { resolveActiveId } from "./resolveActiveId";
import { useActiveIdReconciler } from "./useActiveIdReconciler";
import { useTransferHandoff } from "./useTransferHandoff";

export function useSessionSelection(
	sessions: SessionInfo[],
	activeByRepo: Record<string, string>,
	getActiveId: () => string | null,
	setActiveId: Dispatch<SetStateAction<string | null>>,
) {
	useActiveIdReconciler(
		sessions,
		setActiveId,
		resolveActiveId(activeByRepo, sessions),
	);
	return useTransferHandoff(sessions, getActiveId, setActiveId);
}
