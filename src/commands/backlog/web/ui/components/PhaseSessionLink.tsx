import { Box, ButtonBase } from "@mui/material";
import type { MouseEvent } from "react";
import { useNavigate } from "react-router";
import type { SessionInfo } from "../../../../sessions/web/ui/useSessionSocket";
import type { BacklogItemSummary } from "../types";
import { PhaseSessionDot } from "./PhaseSessionDot";

const linkSx = {
	display: "inline-flex",
	alignItems: "center",
	gap: 0.625,
	color: "warning.main",
	fontWeight: 500,
	fontSize: "0.75rem",
	whiteSpace: "nowrap",
	borderRadius: 1,
};

export function PhaseSessionLink({
	item,
	openSession,
	onSelectSession,
}: {
	item: BacklogItemSummary;
	openSession?: SessionInfo;
	onSelectSession?: (id: string) => void;
}) {
	const navigate = useNavigate();
	if (item.status !== "in-progress" || item.currentPhase == null) return null;
	const label = `phase ${item.currentPhase} of ${item.totalPhases ?? item.currentPhase}`;
	const dot = <PhaseSessionDot pulsing={openSession?.status === "running"} />;
	if (!openSession)
		return (
			<Box component="span" sx={linkSx}>
				{dot}
				{label}
			</Box>
		);
	const handleClick = (event: MouseEvent) => {
		event.stopPropagation();
		onSelectSession?.(openSession.id);
		navigate("/sessions");
	};
	return (
		<ButtonBase
			component="span"
			sx={linkSx}
			title={`Open the ${openSession.status} session`}
			onClick={handleClick}
		>
			{dot}
			{label}
		</ButtonBase>
	);
}
