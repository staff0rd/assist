import { alpha, type Theme } from "@mui/material/styles";
import type { PhaseStatus } from "../types";
import { taskMarkerClassName } from "./taskMarkerClassName";
import { sessionTextSize } from "../../../../sessions/web/ui/App/sessionTextSize";

function slateBorder(theme: Theme, status: PhaseStatus) {
	const { primary, success, divider } = theme.palette;
	if (status === "done") return alpha(success.main, 0.3);
	if (status === "current") return alpha(primary.main, 0.6);
	return divider;
}

function slatePhaseCardSx(theme: Theme, status: PhaseStatus) {
	const done = status === "done";
	return {
		display: "grid",
		gap: 1,
		px: 2,
		py: "14px",
		"& .MuiList-root": { ml: 0 },
		"& .MuiListItem-root": {
			py: "2px",
			fontSize: sessionTextSize(13.5),
			color: done ? "text.primary" : "text.secondary",
		},
		[`& .${taskMarkerClassName}`]: {
			width: 16,
			flexShrink: 0,
			mr: "6px",
			fontSize: "inherit",
			textAlign: "center",
			color: done ? "success.main" : "text.disabled",
		},
		bgcolor: "background.paper",
		borderRadius: `${theme.tokens.radius.md}px`,
		borderColor: slateBorder(theme, status),
		...(status === "current" && {
			boxShadow: `0 0 0 3px ${theme.palette.action.selected}`,
		}),
	};
}

export function phaseCardSx(status: PhaseStatus) {
	return (theme: Theme) => slatePhaseCardSx(theme, status);
}

export const markers: Record<PhaseStatus, string> = {
	done: "✓",
	current: "·",
	upcoming: "·",
};
