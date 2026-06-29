import type { SxProps, Theme } from "@mui/material";

export function cardSx(active: boolean): SxProps<Theme> {
	return {
		display: "block",
		width: "100%",
		textAlign: "left",
		p: "10px 12px",
		mb: 0.5,
		borderRadius: 1.5,
		bgcolor: active ? "action.selected" : "background.default",
		border: 1,
		borderColor: active ? "primary.main" : "transparent",
		cursor: active ? "default" : "pointer",
		transition: "background 0.15s",
		"&:hover": !active ? { bgcolor: "action.hover" } : undefined,
	};
}
