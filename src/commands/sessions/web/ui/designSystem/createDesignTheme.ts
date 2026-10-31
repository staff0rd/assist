import type { PaletteMode } from "@mui/material";
import { createTheme, type Theme } from "@mui/material/styles";
import type { ActiveTokens, Density } from "./DesignTokens";
import { slateComponents } from "./slateComponents";
import { slateDesign } from "./slateDesign";
import { typography } from "./createDesignTheme/typography";
import { baseComponents } from "./createDesignTheme/baseComponents";

function activeTokens(mode: PaletteMode, density: Density): ActiveTokens {
	const { dark, light, densities, ...shared } = slateDesign;
	return {
		...shared,
		...(mode === "dark" ? dark : light),
		mode,
		density: densities[density],
	};
}

export function createDesignTheme(
	mode: PaletteMode,
	density: Density = "desktop",
): Theme {
	const tokens = activeTokens(mode, density);
	const { color } = tokens;
	return createTheme({
		tokens,
		palette: {
			mode,
			background: { default: color.background, paper: color.surface },
			primary: color.primary,
			secondary: color.secondary,
			success: color.success,
			warning: color.warning,
			error: color.error,
			info: color.info,
			text: color.text,
			divider: color.line,
			action: { hover: color.raised, selected: color.selected },
		},
		typography: typography(tokens),
		shape: { borderRadius: tokens.radius.sm },
		spacing: tokens.spacing,
		components: {
			...baseComponents(tokens),
			...slateComponents(tokens),
		},
	});
}
