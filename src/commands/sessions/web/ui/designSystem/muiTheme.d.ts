// oxlint-disable typescript/consistent-type-definitions -- module augmentation must merge into MUI's interfaces
import type { ActiveTokens } from "./DesignTokens";

declare module "@mui/material/styles" {
	interface Theme {
		tokens: ActiveTokens;
	}
	interface ThemeOptions {
		tokens?: ActiveTokens;
	}
	interface Palette {
		check: Palette["primary"];
	}
	interface PaletteOptions {
		check?: PaletteOptions["primary"];
	}
	interface TypographyVariants {
		fontFamilyMono: string;
	}
	interface TypographyVariantsOptions {
		fontFamilyMono?: string;
	}
}

declare module "@mui/material/Button" {
	interface ButtonPropsVariantOverrides {
		tonal: true;
	}
}

declare module "@mui/material/Chip" {
	interface ChipPropsVariantOverrides {
		tonal: true;
	}
	interface ChipPropsColorOverrides {
		check: true;
	}
}

declare module "@mui/material/Button" {
	interface ButtonPropsColorOverrides {
		check: true;
	}
}

declare module "@mui/material/ButtonGroup" {
	interface ButtonGroupPropsVariantOverrides {
		tonal: true;
	}
}
