import type { SxProps, Theme } from "@mui/material";
import type { SessionStatus } from "../../../types";

const attentionBg: Partial<Record<SessionStatus, string>> = {
	waiting: "rgba(255, 167, 38, 0.09)",
	error: "rgba(244, 67, 54, 0.09)",
};

export function sessionCardSx(
	active: boolean,
	status: SessionStatus,
): SxProps<Theme> {
	return {
		display: "grid",
		gridTemplateColumns: "16px minmax(0, 1fr) auto",
		columnGap: 1,
		alignItems: "center",
		width: "100%",
		textAlign: "left",
		p: "5px 10px",
		borderRadius: 0,
		borderLeft: 2,
		borderLeftColor: active ? "primary.main" : "transparent",
		bgcolor: active
			? "action.selected"
			: (attentionBg[status] ?? "background.default"),
		cursor: active ? "default" : "pointer",
		transition: "background 0.2s ease",
		"&:hover": !active ? { bgcolor: "action.hover" } : undefined,
	};
}
