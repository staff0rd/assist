import { alpha, type Theme } from "@mui/material/styles";

export function boardCardSx(tone: "warning" | "check" | "neutral") {
	return (t: Theme) => ({
		display: "flex",
		flexDirection: "column",
		gap: 1.25,
		minHeight: tone === "neutral" ? 140 : 176,
		p: 2,
		minWidth: 0,
		borderRadius: `${t.tokens.radius.md}px`,
		border: 1,
		borderColor:
			tone === "neutral"
				? t.tokens.color.line
				: alpha(t.palette[tone].main, 0.35),
		bgcolor:
			tone === "neutral" ? t.tokens.color.surface : t.tokens.color.wash[tone],
	});
}

export const cardHeadSx = {
	display: "flex",
	alignItems: "center",
	gap: 1,
} as const;

export const cardTitleSx = {
	fontSize: "subtitle1.fontSize",
	fontWeight: 600,
	lineHeight: 1.4,
	overflowWrap: "anywhere",
} as const;

export const cardAgeSx = {
	ml: "auto",
	typography: "caption",
	color: "text.secondary",
	whiteSpace: "nowrap",
} as const;

export const clampSx = (lines: number) =>
	({
		display: "-webkit-box",
		WebkitLineClamp: lines,
		WebkitBoxOrient: "vertical",
		overflow: "hidden",
	}) as const;
