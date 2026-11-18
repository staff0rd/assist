import { sessionTextSize } from "../../../../sessions/web/ui/App/sessionTextSize";

export const sectionHeadingSx = {
	color: "text.disabled",
	mb: 1,
	display: "block",
	letterSpacing: "0.08em",
	fontSize: sessionTextSize(11),
	fontWeight: 600,
	lineHeight: 1.6,
} as const;
