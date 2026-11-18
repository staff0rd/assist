import type { Theme } from "@mui/material/styles";
import { sessionTextSize } from "../../../../sessions/web/ui/App/sessionTextSize";

export function slateProseSx(theme: Theme) {
	const { color, radius } = theme.tokens;
	const code = {
		fontFamily: theme.typography.fontFamilyMono,
		fontSize: "0.86em",
		bgcolor: color.raised,
		borderRadius: "4px",
	};
	return {
		maxWidth: "68ch",
		fontSize: sessionTextSize(14),
		lineHeight: 1.65,
		"& p": { mt: 0, mb: "14px" },
		"&& h1, && h2, && h3, && h4, && h5, && h6": {
			fontSize: sessionTextSize(15),
			fontWeight: 600,
			lineHeight: 1.4,
			mt: 2,
			mb: 0.5,
		},
		"& li": { mb: "6px" },
		"& code": { ...code, px: "5px", py: 0 },
		"& pre": {
			...code,
			p: 1.5,
			mt: 0,
			mb: 1.5,
			overflowX: "auto",
			borderRadius: `${radius.sm}px`,
			border: 1,
			borderColor: color.lineSoft,
		},
		"& pre code": { bgcolor: "transparent", px: 0, fontSize: "1em" },
	};
}
