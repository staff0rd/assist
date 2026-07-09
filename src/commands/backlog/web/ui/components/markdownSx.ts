import type { SxProps, Theme } from "@mui/material";

const staticSx = {
	maxWidth: "72ch",
	lineHeight: 1.7,
	wordBreak: "break-word",
	"& p": { mt: 0, mb: 1.5 },
	"& > :first-of-type": { mt: 0 },
	"& > :last-child": { mb: 0 },
	"& a": { color: "primary.main", textDecoration: "underline" },
	"& a:hover": { color: "primary.light" },
	"& h1, & h2, & h3, & h4, & h5, & h6": {
		fontWeight: 600,
		lineHeight: 1.3,
		mt: 2.5,
		mb: 1,
	},
	"& h1": { fontSize: "1.6rem" },
	"& h2": { fontSize: "1.35rem" },
	"& h3": { fontSize: "1.15rem" },
	"& h4": { fontSize: "1.05rem" },
	"& h5, & h6": { fontSize: "1rem" },
	"& strong": { fontWeight: 600 },
	"& em": { fontStyle: "italic" },
	"& ul, & ol": { mt: 0, mb: 1.5, pl: 3 },
	"& li": { mb: 0.5 },
	"& li > ul, & li > ol": { mt: 0.5, mb: 0 },
	"& code": {
		fontFamily: "monospace",
		fontSize: "0.85em",
		px: 0.5,
		py: 0.25,
		borderRadius: 0.5,
	},
	"& pre": {
		p: 1.5,
		borderRadius: 1,
		overflowX: "auto",
		mt: 0,
		mb: 1.5,
	},
	"& pre code": { bgcolor: "transparent", px: 0, py: 0, fontSize: "0.85em" },
	"& blockquote": {
		m: 0,
		mb: 1.5,
		pl: 2,
		borderLeft: 4,
		borderColor: "divider",
		color: "text.secondary",
	},
	"& hr": { border: "none", borderTop: 1, borderColor: "divider", my: 2 },
	"& table": {
		borderCollapse: "collapse",
		width: "auto",
		mb: 1.5,
		display: "block",
		overflowX: "auto",
	},
	"& th, & td": {
		border: 1,
		borderColor: "divider",
		px: 1,
		py: 0.5,
		textAlign: "left",
	},
	"& th": { fontWeight: 600 },
	"& img": { maxWidth: "100%" },
} as const;

export const markdownSx: SxProps<Theme> = (theme) => {
	const codeBg =
		theme.palette.mode === "dark"
			? "rgba(255,255,255,0.08)"
			: "rgba(0,0,0,0.06)";
	return {
		...staticSx,
		"& code": { ...staticSx["& code"], bgcolor: codeBg },
		"& pre": { ...staticSx["& pre"], bgcolor: codeBg },
		"& th": { ...staticSx["& th"], bgcolor: codeBg },
	};
};
