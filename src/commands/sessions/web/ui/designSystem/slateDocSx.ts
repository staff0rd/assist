import type { Theme } from "@mui/material/styles";

const outrankMarkdown = (selector: string) =>
	selector
		.split(",")
		.map((s) => `&& .markdown ${s.trim()}`)
		.join(", ");

export function slateDocSx(t: Theme) {
	const { color, radius } = t.tokens;
	return {
		px: 2.5,
		py: 2,
		fontSize: 14,
		lineHeight: 1.6,
		[outrankMarkdown("")]: { lineHeight: 1.6 },
		[outrankMarkdown("h1, h2, h3, h4, h5, h6")]: {
			fontSize: 15,
			fontWeight: 600,
			lineHeight: 1.4,
			mt: 2,
			mb: 1,
		},
		[outrankMarkdown("ul, ol")]: { pl: 2.5, mb: 2 },
		[outrankMarkdown("li")]: { mb: "6px" },
		[outrankMarkdown("code")]: {
			fontFamily: t.typography.fontFamilyMono,
			fontSize: "0.86em",
			px: "5px",
			py: 0,
			bgcolor: color.raised,
			border: 1,
			borderColor: color.lineSoft,
			borderRadius: "4px",
		},
		[outrankMarkdown("pre")]: {
			bgcolor: color.raised,
			border: 1,
			borderColor: color.lineSoft,
			borderRadius: `${radius.sm}px`,
		},
		[outrankMarkdown("pre code")]: { border: 0, px: 0, bgcolor: "transparent" },
	};
}
