import type { Theme } from "@mui/material/styles";

export function cardSessionViewSx(t: Theme) {
	return {
		flex: 1,
		minHeight: 0,
		display: "flex",
		flexDirection: "column",
		borderBottom: 1,
		borderColor: t.tokens.color.line,
	} as const;
}
