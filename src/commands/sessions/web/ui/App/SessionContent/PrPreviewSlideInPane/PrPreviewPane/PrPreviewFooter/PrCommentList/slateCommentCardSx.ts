import { sessionTextSize } from "../../../../../sessionTextSize";
import type { Theme } from "@mui/material/styles";

export const slateCommentsSx = (t: Theme) => ({
	display: "grid",
	gap: 1,
	maxHeight: 220,
	overflow: "auto",
	px: 2,
	py: 1.25,
	borderTop: 1,
	borderColor: t.tokens.color.lineSoft,
});

export const slateCommentsHeadingSx = {
	fontSize: sessionTextSize(11),
	fontWeight: 600,
	letterSpacing: "0.06em",
	textTransform: "uppercase",
	color: "text.secondary",
} as const;

export const slateCommentCardSx = (t: Theme) => ({
	display: "grid",
	gridTemplateColumns: "minmax(0, 1fr) auto",
	gap: "4px 8px",
	px: 1.25,
	py: 1,
	borderRadius: `${t.tokens.radius.sm}px`,
	bgcolor: t.tokens.color.raised,
	border: 1,
	borderColor: t.tokens.color.lineSoft,
	fontSize: sessionTextSize(12.5),
});

export const slateCommentCloseSx = {
	gridColumn: 2,
	gridRow: 1,
	width: 20,
	height: 20,
	color: "text.disabled",
	"& .MuiSvgIcon-root": { fontSize: 14 },
} as const;
