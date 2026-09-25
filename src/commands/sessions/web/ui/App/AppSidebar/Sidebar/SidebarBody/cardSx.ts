import type { SxProps, Theme } from "@mui/material";

export function cardSx(active: boolean): SxProps<Theme> {
	return {
		display: "block",
		width: "100%",
		textAlign: "left",
		p: "5px 10px",
		borderRadius: 0,
		bgcolor: active ? "action.selected" : "background.default",
		borderLeft: 2,
		borderLeftColor: active ? "primary.main" : "transparent",
		cursor: active ? "default" : "pointer",
		transition: "background 0.15s",
		"&:hover": !active ? { bgcolor: "action.hover" } : undefined,
	};
}
