import type { Theme } from "@mui/material/styles";
import type { DisplayStatus } from "../displayStatus";

const rowSx = {
	width: "100%",
	display: "grid",
	gridTemplateColumns: "18px 1fr auto",
	columnGap: 1.25,
	rowGap: 0.25,
	alignItems: "start",
	textAlign: "left",
	px: 2,
	py: 1.375,
	borderBottom: 1,
	borderColor: (t: Theme) => t.tokens.color.lineSoft,
} as const;

export function phoneRowSx(status: DisplayStatus) {
	const bgcolor =
		status === "waiting"
			? (t: Theme) => t.tokens.color.wash.warning
			: status === "error"
				? (t: Theme) => t.tokens.color.wash.error
				: "background.default";
	return { ...rowSx, bgcolor };
}

export const phoneRowTitleSx = {
	gridColumn: 2,
	gridRow: 1,
	fontSize: 16,
	fontWeight: 500,
	lineHeight: "21px",
	display: "-webkit-box",
	WebkitLineClamp: 2,
	WebkitBoxOrient: "vertical",
	overflow: "hidden",
	minWidth: 0,
} as const;

export const phoneRowChevronSx = {
	gridColumn: 3,
	gridRow: "1 / span 3",
	alignSelf: "center",
	color: "text.disabled",
} as const;

export const phoneRowMetaSx = {
	gridColumn: 2,
	display: "flex",
	flexWrap: "wrap",
	alignItems: "center",
	gap: 0.75,
	fontSize: 13,
	color: "text.secondary",
	minWidth: 0,
} as const;

export const phoneRowMessageSx = {
	gridColumn: 2,
	mt: 0.25,
	fontSize: 14,
	lineHeight: "19px",
	color: "text.primary",
	display: "-webkit-box",
	WebkitLineClamp: 3,
	WebkitBoxOrient: "vertical",
	overflow: "hidden",
	whiteSpace: "pre-line",
} as const;
