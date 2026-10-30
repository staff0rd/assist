import type { Theme } from "@mui/material/styles";

export function popoverPaperSx(theme: Theme) {
	return {
		border: `1px solid ${theme.palette.divider}`,
		boxShadow: theme.tokens.elevation.overlay,
	};
}
