import { alpha, type Theme } from "@mui/material/styles";

type TokenBadgeTone = "primary" | "secondary" | "success" | "check" | "neutral";

function toneColors(t: Theme, tone: TokenBadgeTone) {
	if (tone === "neutral")
		return { color: t.palette.text.secondary, borderColor: t.palette.divider };
	const { main } = t.palette[tone];
	return { color: main, borderColor: alpha(main, 0.35) };
}

export function tokenBadgeSx(tone: TokenBadgeTone) {
	return (t: Theme) => ({
		display: "inline-block",
		fontFamily: t.typography.fontFamilyMono,
		fontSize: 10,
		fontWeight: 400,
		lineHeight: "16px",
		px: "5px",
		border: 1,
		borderRadius: "4px",
		whiteSpace: "nowrap",
		opacity: 1,
		...toneColors(t, tone),
	});
}
