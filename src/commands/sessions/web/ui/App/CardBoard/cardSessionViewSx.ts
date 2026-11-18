import { keyframes, type Theme } from "@mui/material/styles";

const slideDown = keyframes`
	from { transform: translateY(-100%); }
	to { transform: translateY(0); }
`;

export function cardSessionViewSx(t: Theme) {
	return {
		flex: "0 0 50%",
		minHeight: 0,
		display: "flex",
		flexDirection: "column",
		borderBottom: 1,
		borderColor: t.tokens.color.line,
		animation: `${slideDown} 220ms ease-out`,
		"@media (prefers-reduced-motion: reduce)": { animation: "none" },
	} as const;
}
