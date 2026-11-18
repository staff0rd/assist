import { sessionTextSize } from "../sessionTextSize";

export const releaseLegendSx = {
	legend: {
		display: "flex",
		flexWrap: "wrap",
		alignItems: "center",
		gap: 2,
		pt: 1.5,
		mt: 1,
		borderTop: 1,
		borderColor: "divider",
		fontSize: sessionTextSize(14.4),
		color: "text.secondary",
	},
	entry: { display: "inline-flex", alignItems: "center", gap: 0.75 },
	head: {
		fontFamily: "fontFamilyMono",
		fontSize: sessionTextSize(12.6),
		letterSpacing: "0.09em",
		textTransform: "uppercase",
	},
	edge: { width: 22, height: 2 },
} as const;
