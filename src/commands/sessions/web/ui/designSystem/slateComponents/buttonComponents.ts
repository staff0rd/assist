import { alpha, type Components, type Theme } from "@mui/material/styles";
import type { ActiveTokens } from "../DesignTokens";
import { buttonSizeVariants } from "./buttonSizeVariants";
import { tonalButtonVariants } from "./tonalButtonVariants";

const buttonIcon = { "& > *:nth-of-type(1)": { fontSize: 16 } };

export function buttonComponents(tokens: ActiveTokens): Components<Theme> {
	const { color, radius, density } = tokens;
	const { minHeight, fontSize, paddingX } = density.button;
	return {
		MuiButton: {
			defaultProps: { disableElevation: true },
			styleOverrides: {
				root: {
					minHeight,
					padding: `6px ${paddingX}px`,
					borderRadius: radius.sm,
					fontSize,
					fontWeight: 600,
					lineHeight: "18px",
				},
				startIcon: { marginLeft: -2, marginRight: 6, ...buttonIcon },
				endIcon: { marginLeft: 6, marginRight: -2, ...buttonIcon },
			},
			variants: [
				...buttonSizeVariants,
				{
					props: { variant: "text", color: "primary" },
					style: {
						color: color.text.secondary,
						"&:hover": {
							backgroundColor: color.raised,
							color: color.text.primary,
						},
					},
				},
				...tonalButtonVariants(tokens),
				{
					props: { variant: "outlined", color: "error" },
					style: {
						borderColor: alpha(color.error.main, 0.35),
						"&:hover": {
							borderColor: color.error.main,
							backgroundColor: alpha(color.error.main, 0.1),
						},
					},
				},
			],
		},
	};
}
