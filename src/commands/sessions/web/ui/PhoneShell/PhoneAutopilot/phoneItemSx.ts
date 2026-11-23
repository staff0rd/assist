import { alpha, type Theme } from "@mui/material/styles";
import { paletteColor } from "../../designSystem/paletteColor";
import { phoneRowMetaSx, phoneRowTitleSx } from "../phoneRowSx";

export const phoneItemSx = {
	row: (wash: boolean) => ({
		borderBottom: 1,
		borderColor: (t: Theme) => t.tokens.color.lineSoft,
		bgcolor: wash
			? (t: Theme) => t.tokens.color.wash.warning
			: "background.default",
	}),
	main: {
		width: "100%",
		display: "grid",
		gridTemplateColumns: "18px 1fr auto",
		columnGap: 1.25,
		rowGap: 0.375,
		alignItems: "start",
		textAlign: "left",
		px: 2,
		py: 1.375,
	},
	dot: (colorPath: string, ring: boolean) => (t: Theme) => {
		const color = paletteColor(t, colorPath);
		return {
			gridColumn: 1,
			gridRow: 1,
			width: 10,
			height: 10,
			mt: "6px",
			borderRadius: "50%",
			bgcolor: color,
			boxShadow: ring ? `0 0 0 3px ${alpha(color, 0.25)}` : undefined,
		};
	},
	title: phoneRowTitleSx,
	meta: phoneRowMetaSx,
	id: { fontFamily: "fontFamilyMono", fontSize: 12 },
	bar: {
		width: 56,
		height: 4,
		borderRadius: "2px",
		bgcolor: "divider",
		overflow: "hidden",
	},
	fill: (percent: number) => ({
		display: "block",
		height: "100%",
		bgcolor: "primary.main",
		width: `${percent}%`,
	}),
	line: {
		gridColumn: 2,
		mt: 0.25,
		fontSize: 14,
		lineHeight: "19px",
		minWidth: 0,
		display: "-webkit-box",
		WebkitLineClamp: 3,
		WebkitBoxOrient: "vertical",
		overflow: "hidden",
	},
	kv: {
		gridColumn: 2,
		display: "flex",
		gap: 0.75,
		minWidth: 0,
		fontSize: 13,
		color: "text.secondary",
	},
	key: {
		flex: "none",
		fontFamily: "fontFamilyMono",
		fontSize: 12,
		color: "info.main",
	},
	actions: (count: number) => ({
		display: "grid",
		gridTemplateColumns: count > 1 ? "1fr 1fr" : "1fr",
		gap: 1,
		pl: 5.5,
		pr: 2,
		pb: 1.5,
	}),
	empty: {
		px: 2,
		py: 2.5,
		textAlign: "center",
		color: "text.secondary",
		fontSize: 15,
	},
} as const;
