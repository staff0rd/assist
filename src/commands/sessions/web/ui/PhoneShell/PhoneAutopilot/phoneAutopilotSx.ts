import type { Theme } from "@mui/material/styles";
import { touchTarget } from "../../designSystem/touchTarget";

const button = {
	minHeight: touchTarget,
	borderRadius: "10px",
	fontWeight: 600,
} as const;

export const phoneAutopilotSx = {
	body: {
		flex: 1,
		minHeight: 0,
		overflowY: "auto",
		WebkitOverflowScrolling: "touch",
		pb: 2,
	},
	alert: { mx: 2, mt: 1.5 },
	banner: (t: Theme) => ({
		mx: 2,
		mt: 1.5,
		px: 1.75,
		py: 1.5,
		borderRadius: "12px",
		bgcolor: t.tokens.color.wash.error,
		border: 1,
		borderColor: "error.main",
		fontSize: 14,
		"& strong": { color: "error.main" },
	}),
	card: {
		mx: 2,
		mt: 1.5,
		px: 2,
		pt: 1.75,
		pb: 2,
		border: 1,
		borderColor: "divider",
		borderRadius: "12px",
		bgcolor: "background.paper",
		display: "grid",
		gap: 1.5,
	},
	cardTop: {
		display: "flex",
		alignItems: "center",
		justifyContent: "space-between",
		gap: 1,
		minWidth: 0,
	},
	via: {
		fontFamily: "fontFamilyMono",
		fontSize: 12,
		color: "text.secondary",
		minWidth: 0,
		overflow: "hidden",
		textOverflow: "ellipsis",
		whiteSpace: "nowrap",
	},
	fields: {
		m: 0,
		display: "grid",
		gridTemplateColumns: "auto 1fr",
		gap: "6px 16px",
		fontSize: 14,
		"& dt": { color: "text.secondary" },
		"& dd": { m: 0, minWidth: 0, fontVariantNumeric: "tabular-nums" },
	},
	small: { display: "block", fontSize: 12, color: "text.secondary" },
	buttons: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1 },
	tonal: (t: Theme) => ({
		...button,
		bgcolor: t.tokens.color.wash.accent,
		color: "primary.main",
	}),
	primary: button,
} as const;
