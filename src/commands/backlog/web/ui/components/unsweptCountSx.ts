import { alpha, type Theme } from "@mui/material/styles";

export const unsweptCountSx = (t: Theme) => ({
	ml: 0.75,
	fontFamily: t.typography.fontFamilyMono,
	fontSize: 12,
	lineHeight: "18px",
	minWidth: 20,
	px: 0.75,
	borderRadius: 999,
	textAlign: "center",
	bgcolor: alpha(t.palette.info.main, 0.1),
	color: "info.main",
});
