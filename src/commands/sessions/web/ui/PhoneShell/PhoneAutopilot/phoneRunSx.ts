import type { Theme } from "@mui/material/styles";

export const phoneRunSx = {
	run: {
		borderBottom: 1,
		borderColor: (t: Theme) => t.tokens.color.lineSoft,
	},
	summary: {
		width: "100%",
		display: "grid",
		gridTemplateColumns: "1fr auto",
		gap: "2px 10px",
		textAlign: "left",
		px: 2,
		py: 1.375,
	},
	when: {
		fontSize: 15,
		fontWeight: 500,
		fontVariantNumeric: "tabular-nums",
	},
	sub: {
		gridColumn: 1,
		fontSize: 13,
		color: "text.secondary",
		minWidth: 0,
		overflow: "hidden",
		textOverflow: "ellipsis",
		whiteSpace: "nowrap",
	},
	twisty: (open: boolean) => ({
		gridColumn: 2,
		gridRow: "1 / span 2",
		alignSelf: "center",
		color: "text.disabled",
		transform: open ? "rotate(90deg)" : "none",
		transition: "transform .2s ease",
	}),
	fields: {
		m: 0,
		px: 2,
		pb: 1.5,
		display: "grid",
		gridTemplateColumns: "auto 1fr",
		gap: "4px 12px",
		fontSize: 14,
		"& dt": {
			fontFamily: "fontFamilyMono",
			fontSize: 12,
			color: "info.main",
			pt: "2px",
		},
		"& dd": { m: 0, color: "text.secondary", minWidth: 0 },
	},
	more: { display: "flex", width: "calc(100% - 32px)", mx: 2, mt: 1.25, mb: 2 },
} as const;
