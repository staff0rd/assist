import { alpha, type Theme } from "@mui/material/styles";

export type CardTone = "warning" | "check" | "neutral";

function toneColor(t: Theme, tone: CardTone): string {
	return tone === "neutral" ? t.palette.text.secondary : t.palette[tone].main;
}

export function boardCardSx(tone: CardTone, selected: boolean) {
	return (t: Theme) => ({
		display: "flex",
		flexDirection: "column",
		alignItems: "stretch",
		justifyContent: "flex-start",
		textAlign: "left",
		gap: 1.5,
		minHeight: tone === "neutral" ? 168 : 208,
		p: 2.5,
		minWidth: 0,
		font: "inherit",
		color: "text.primary",
		cursor: "pointer",
		borderRadius: `${t.tokens.radius.md}px`,
		border: 1,
		borderColor:
			tone === "neutral"
				? t.tokens.color.line
				: alpha(t.palette[tone].main, 0.35),
		bgcolor:
			tone === "neutral" ? t.tokens.color.surface : t.tokens.color.wash[tone],
		boxShadow: selected
			? `0 0 0 ${t.tokens.selection.ringWidth}px ${t.palette.primary.main}`
			: "none",
		transition: "border-color 120ms, background-color 120ms",
		"&:hover": {
			borderColor: alpha(toneColor(t, tone), 0.7),
			bgcolor:
				tone === "neutral"
					? t.tokens.color.raised
					: alpha(t.palette[tone].main, 0.14),
		},
		"&.Mui-focusVisible": {
			outline: `${t.tokens.selection.ringWidth}px solid ${t.palette.primary.main}`,
			outlineOffset: 2,
		},
	});
}
