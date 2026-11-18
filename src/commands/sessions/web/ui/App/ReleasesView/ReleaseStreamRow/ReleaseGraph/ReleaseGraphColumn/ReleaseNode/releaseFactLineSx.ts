import { sessionTextSize } from "../../../../../sessionTextSize";

export const releaseFactLineSx = {
	display: "flex",
	alignItems: "baseline",
	flexWrap: "wrap",
	gap: 1,
	fontFamily: "fontFamilyMono",
	fontSize: sessionTextSize(13.2),
	color: "text.secondary",
} as const;
