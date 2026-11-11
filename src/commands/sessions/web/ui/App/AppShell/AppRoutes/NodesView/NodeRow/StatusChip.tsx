import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import CheckIcon from "@mui/icons-material/Check";
import CloudOffIcon from "@mui/icons-material/CloudOff";
import ErrorIcon from "@mui/icons-material/ErrorOutlineRounded";
import HourglassEmptyIcon from "@mui/icons-material/HourglassEmpty";
import PauseIcon from "@mui/icons-material/Pause";
import PowerOffIcon from "@mui/icons-material/PowerSettingsNew";
import ReplayIcon from "@mui/icons-material/Replay";
import WarningIcon from "@mui/icons-material/Warning";
import BlockIcon from "@mui/icons-material/Block";
import LinkOffIcon from "@mui/icons-material/LinkOff";
import Box from "@mui/material/Box";
import { alpha, type Theme } from "@mui/material/styles";
import type { ReactNode } from "react";
import type { NodeStatus, StatusKind } from "../nodeStatus";

type Tone = "success" | "warning" | "error" | "neutral";

const look: Record<StatusKind, { tone: Tone; icon: ReactNode }> = {
	ok: { tone: "success", icon: <CheckIcon /> },
	ready: { tone: "warning", icon: <ArrowUpwardIcon /> },
	diverged: { tone: "error", icon: <WarningIcon /> },
	retrying: { tone: "warning", icon: <ReplayIcon /> },
	paused: { tone: "neutral", icon: <PauseIcon /> },
	off: { tone: "neutral", icon: <PowerOffIcon /> },
	failing: { tone: "error", icon: <ErrorIcon /> },
	loading: { tone: "neutral", icon: <HourglassEmptyIcon /> },
	unavailable: { tone: "neutral", icon: <CloudOffIcon /> },
	disconnected: { tone: "error", icon: <LinkOffIcon /> },
	connecting: { tone: "neutral", icon: <HourglassEmptyIcon /> },
	blocked: { tone: "warning", icon: <BlockIcon /> },
};

function toneColor(theme: Theme, tone: Tone): string {
	return tone === "neutral"
		? theme.palette.text.secondary
		: theme.palette[tone].main;
}

export function StatusChip({ status }: { status: NodeStatus }) {
	const { tone, icon } = look[status.kind];
	return (
		<Box
			component="span"
			sx={(theme) => ({
				alignSelf: "flex-start",
				display: "inline-flex",
				alignItems: "center",
				gap: 0.75,
				height: 24,
				px: 1.25,
				borderRadius: 3,
				fontSize: 12,
				fontWeight: 500,
				whiteSpace: "nowrap",
				color: toneColor(theme, tone),
				bgcolor:
					tone === "neutral"
						? theme.palette.action.hover
						: alpha(theme.palette[tone].main, 0.1),
				border: tone === "neutral" ? `1px solid ${theme.palette.divider}` : 0,
				"& svg": { fontSize: 14 },
			})}
		>
			{icon}
			{status.label}
		</Box>
	);
}
