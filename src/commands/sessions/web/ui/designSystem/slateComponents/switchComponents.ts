import type { Components, Theme } from "@mui/material/styles";
import type { ActiveTokens } from "../DesignTokens";

export function switchComponents({
	color,
	density,
}: ActiveTokens): Components<Theme> {
	const { width, height, thumb } = density.switch;
	const pill = {
		width,
		height,
		padding: 0,
		"& .MuiSwitch-switchBase": {
			padding: 2,
			color: color.text.secondary,
			"&.Mui-checked": {
				transform: `translateX(${width - height}px)`,
				color: color.primary.contrastText,
			},
			"&.Mui-checked + .MuiSwitch-track": {
				backgroundColor: color.primary.main,
				opacity: 1,
			},
		},
		"& .MuiSwitch-thumb": { width: thumb, height: thumb, boxShadow: "none" },
		"& .MuiSwitch-track": {
			borderRadius: height / 2,
			backgroundColor: color.line,
			opacity: 1,
		},
	};
	return {
		MuiSwitch: {
			styleOverrides: { root: pill },
		},
		MuiFormControlLabel: {
			styleOverrides: {
				root: { "&:has(.MuiSwitch-root)": { marginLeft: 0, gap: 8 } },
			},
		},
	};
}
