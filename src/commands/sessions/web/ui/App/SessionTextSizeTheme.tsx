import { type Theme, ThemeProvider } from "@mui/material/styles";
import type { ReactNode } from "react";
import { sessionTextSize } from "./sessionTextSize";

const variants = [
	"h1",
	"h2",
	"h3",
	"h4",
	"h5",
	"h6",
	"subtitle1",
	"subtitle2",
	"body1",
	"body2",
	"button",
	"caption",
	"overline",
] as const;

function offsetTypography(outer: Theme): Theme {
	const typography = { ...outer.typography };
	for (const variant of variants) {
		const style = outer.typography[variant];
		if (style?.fontSize === undefined) continue;
		typography[variant] = {
			...style,
			fontSize: sessionTextSize(style.fontSize),
		};
	}
	return { ...outer, typography };
}

export function SessionTextSizeTheme({ children }: { children: ReactNode }) {
	return <ThemeProvider theme={offsetTypography}>{children}</ThemeProvider>;
}
