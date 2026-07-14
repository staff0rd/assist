import { useCallback } from "react";
import { useNavigate } from "react-router";
import type { HistoricalSession, SidebarTab } from "./types";
import type { useSessionSocket } from "./useSessionSocket";

export function useSidebarNavigation(
	socket: ReturnType<typeof useSessionSocket>,
	onTabChange: (tab: SidebarTab) => void,
) {
	const navigate = useNavigate();
	const { selectSession, resumeSession, viewTranscript } = socket;

	const handleSelect = useCallback(
		(id: string) => {
			selectSession(id);
			navigate("/sessions");
		},
		[selectSession, navigate],
	);

	const handleResume = useCallback(
		(session: HistoricalSession) => {
			resumeSession(session.sessionId, session.cwd, session.name);
			onTabChange("active");
			navigate("/sessions");
		},
		[resumeSession, onTabChange, navigate],
	);

	const handleView = useCallback(
		(session: HistoricalSession) => {
			viewTranscript(session.sessionId);
			navigate("/sessions");
		},
		[viewTranscript, navigate],
	);

	return { handleSelect, handleResume, handleView };
}
