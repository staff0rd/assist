import { alpha, type Theme } from "@mui/material/styles";
import { paletteColor } from "../../designSystem/paletteColor";

const smallButton = {
	minHeight: 36,
	borderRadius: "8px",
	fontSize: 14,
	fontWeight: 600,
} as const;

const tonal = (colorPath: string) => (t: Theme) => {
	const color = paletteColor(t, colorPath);
	return {
		...smallButton,
		color,
		bgcolor: alpha(color, 0.14),
		"&:active": { bgcolor: alpha(color, 0.24) },
	};
};

export const phoneItemButtonSx = {
	danger: tonal("error.main"),
	tonal: tonal("primary.main"),
	primary: smallButton,
} as const;
