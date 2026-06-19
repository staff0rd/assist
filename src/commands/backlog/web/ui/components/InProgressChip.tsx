import { keyframes } from "@emotion/react";
import { Chip } from "@mui/material";
import type { MouseEvent } from "react";
import { useNavigate } from "react-router";
import type { SessionInfo } from "../../../../sessions/web/ui/useSessionSocket";
import { statusChipColors } from "./typeChipColors";

const chipSx = {
	flexShrink: 0,
	fontWeight: 500,
	fontSize: "0.75rem",
	height: 22,
} as const;

const dash = "#2979ff";

const marchAnts = keyframes`
	to {
		background-position: 14px 0, -14px 100%, 0 -14px, 100% 14px;
	}
`;

const animatedChipSx = {
	...chipSx,
	border: "none",
	backgroundImage: `
		repeating-linear-gradient(90deg, ${dash} 0 7px, transparent 7px 14px),
		repeating-linear-gradient(90deg, ${dash} 0 7px, transparent 7px 14px),
		repeating-linear-gradient(0deg, ${dash} 0 7px, transparent 7px 14px),
		repeating-linear-gradient(0deg, ${dash} 0 7px, transparent 7px 14px)
	`,
	backgroundSize: "14px 3px, 14px 3px, 3px 14px, 3px 14px",
	backgroundPosition: "0 0, 0 100%, 0 0, 100% 0",
	backgroundRepeat: "repeat-x, repeat-x, repeat-y, repeat-y",
	animation: `${marchAnts} 0.5s linear infinite`,
} as const;

export function InProgressChip({
	openSession,
	onSelectSession,
}: {
	openSession?: SessionInfo;
	onSelectSession?: (id: string) => void;
}) {
	const navigate = useNavigate();
	const handleClick = (event: MouseEvent) => {
		event.stopPropagation();
		if (!openSession) return;
		onSelectSession?.(openSession.id);
		navigate("/sessions");
	};
	return (
		<Chip
			label="in progress"
			size="small"
			color={statusChipColors["in-progress"]}
			sx={openSession?.status === "running" ? animatedChipSx : chipSx}
			clickable={!!openSession}
			onClick={openSession ? handleClick : undefined}
		/>
	);
}
