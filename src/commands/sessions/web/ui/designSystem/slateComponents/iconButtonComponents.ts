import type { Components, Theme } from "@mui/material/styles";
import type { ActiveTokens } from "../DesignTokens";

const square = (side: number, icon: number) => ({
	width: side,
	height: side,
	"& .MuiSvgIcon-root": { fontSize: icon },
});

export function iconButtonComponents({
	color,
	radius,
	density,
}: ActiveTokens): Components<Theme> {
	const { side, icon, smallSide, smallIcon } = density.iconButton;
	return {
		MuiIconButton: {
			styleOverrides: {
				root: {
					...square(side, icon),
					padding: 0,
					borderRadius: radius.sm,
					"&:hover": { backgroundColor: color.raised },
				},
			},
			variants: [
				{ props: { size: "small" }, style: square(smallSide, smallIcon) },
				{
					props: { color: "default" },
					style: {
						color: color.text.secondary,
						"&:hover": { color: color.text.primary },
						...(!color.appBar && {
							".MuiAppBar-root &, .MuiAppBar-root &:hover": {
								color: "inherit",
							},
						}),
					},
				},
			],
		},
	};
}
