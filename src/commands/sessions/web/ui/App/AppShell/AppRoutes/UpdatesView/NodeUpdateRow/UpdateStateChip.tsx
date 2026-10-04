import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import CheckIcon from "@mui/icons-material/Check";
import CloudOffIcon from "@mui/icons-material/CloudOff";
import PauseIcon from "@mui/icons-material/Pause";
import ReplayIcon from "@mui/icons-material/Replay";
import WarningIcon from "@mui/icons-material/Warning";
import Box from "@mui/material/Box";
import { alpha, type Theme } from "@mui/material/styles";
import type { ReactNode } from "react";
import type { UpdateState, UpdateStateKind } from "../updateState";

type Tone = "success" | "warning" | "error" | "neutral";

const look: Record<UpdateStateKind, { tone: Tone; icon: ReactNode }> = {
	ok: { tone: "success", icon: <CheckIcon /> },
	ready: { tone: "warning", icon: <ArrowUpwardIcon /> },
	diverged: { tone: "error", icon: <WarningIcon /> },
	retrying: { tone: "warning", icon: <ReplayIcon /> },
	off: { tone: "neutral", icon: <PauseIcon /> },
	unavailable: { tone: "neutral", icon: <CloudOffIcon /> },
};

function toneColor(theme: Theme, tone: Tone): string {
	return tone === "neutral"
		? theme.palette.text.secondary
		: theme.palette[tone].main;
}

export function UpdateStateChip({ state }: { state: UpdateState }) {
	const { tone, icon } = look[state.kind];
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
			{state.label}
		</Box>
	);
}
