import { alpha, type Theme } from "@mui/material/styles";

export const workingDotSx = {
	flexShrink: 0,
	width: 8,
	height: 8,
	borderRadius: "50%",
	bgcolor: "success.main",
	boxShadow: (t: Theme) => `0 0 0 3px ${alpha(t.palette.success.main, 0.18)}`,
} as const;
