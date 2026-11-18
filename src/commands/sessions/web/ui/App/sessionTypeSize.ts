import type { Theme } from "@mui/material/styles";
import { sessionTextSize } from "./sessionTextSize";

export function sessionTypeSize(variant: "caption" | "body2") {
	return (theme: Theme): string =>
		sessionTextSize(theme.typography[variant].fontSize ?? "inherit");
}
