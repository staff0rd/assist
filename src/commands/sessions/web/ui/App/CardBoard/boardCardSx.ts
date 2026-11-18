import { alpha, type Theme } from "@mui/material/styles";
import { toneColor } from "./toneColor";
import { cardMinHeight } from "./cardMinHeight";

export type CardTone = "warning" | "check" | "neutral";

export function boardCardSx(tone: CardTone, selected: boolean) {
	return (t: Theme) => ({
		display: "flex",
		flexDirection: "column",
		alignItems: "stretch",
		justifyContent: "flex-start",
		textAlign: "left",
		gap: 1.5,
		minHeight: cardMinHeight(tone),
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
