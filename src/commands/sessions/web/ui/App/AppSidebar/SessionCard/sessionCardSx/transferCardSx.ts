import { keyframes } from "@emotion/react";
import { alpha, type Theme } from "@mui/material/styles";
import type { TransferTone } from "../../../../transfer/transferIndicator";
import { cardTitleClassName } from "../cardTitleClassName";

const sweep = keyframes`
	from { background-position: -40% 0; }
	to { background-position: 140% 0; }
`;

function pendingSx(t: Theme, active: boolean) {
	const accent = t.palette.primary.main;
	return {
		position: "relative",
		overflow: "hidden",
		bgcolor: t.tokens.color.wash.accent,
		borderColor: active ? accent : alpha(accent, 0.3),
		[`& .${cardTitleClassName}`]: { color: "text.secondary" },
		"&::after": {
			content: '""',
			position: "absolute",
			left: 0,
			right: 0,
			bottom: 0,
			height: 2,
			background: `linear-gradient(90deg, transparent, ${accent}, transparent)`,
			backgroundSize: "40% 100%",
			backgroundRepeat: "no-repeat",
			animation: `${sweep} 1.4s linear infinite`,
			"@media (prefers-reduced-motion: reduce)": {
				animation: "none",
				backgroundSize: "100% 100%",
			},
		},
	} as const;
}

export function transferCardSx(
	t: Theme,
	active: boolean,
	tone: TransferTone | undefined,
) {
	if (tone === "pending") return pendingSx(t, active);
	if (tone === "failed") return { bgcolor: t.tokens.color.wash.error };
	return {};
}
