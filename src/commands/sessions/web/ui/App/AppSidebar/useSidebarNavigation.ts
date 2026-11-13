import { useCallback } from "react";
import { useNavigate } from "react-router";
import type { HistoricalSession, SidebarTab } from "../../types";
import type { useSessionSocket } from "../../useSessionSocket";
import { useHistorySearchQuery } from "../useHistorySearchQuery";

export function useSidebarNavigation(
	socket: ReturnType<typeof useSessionSocket>,
	onTabChange: (tab: SidebarTab) => void,
) {
	const navigate = useNavigate();
	const { selectSession, resumeSession, viewTranscript } = socket;
	const { setViewedTerm } = useHistorySearchQuery();

	const handleSelect = useCallback(
		(id: string) => {
			selectSession(id);
			navigate("/sessions");
		},
		[selectSession, navigate],
	);

	const handleResume = useCallback(
		(session: HistoricalSession) => {
			resumeSession(
				session.sessionId,
				session.cwd,
				session.name,
				session.harness,
				session.node,
			);
			onTabChange("active");
			navigate("/sessions");
		},
		[resumeSession, onTabChange, navigate],
	);

	const handleView = useCallback(
		(session: HistoricalSession, searchTerm = "") => {
			setViewedTerm(searchTerm);
			viewTranscript(session.sessionId, session.node);
			navigate("/sessions");
		},
		[setViewedTerm, viewTranscript, navigate],
	);

	return { handleSelect, handleResume, handleView };
}
