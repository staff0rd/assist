import type { Theme } from "@mui/material/styles";
import type { DisplayStatus } from "../displayStatus";
import type { TransferTone } from "../transfer/transferIndicator";

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

const rowWash: Partial<
	Record<DisplayStatus, keyof Theme["tokens"]["color"]["wash"]>
> = {
	waiting: "warning",
	question: "warning",
	design: "warning",
	check: "warning",
	error: "error",
};

const transferWash: Partial<
	Record<TransferTone, keyof Theme["tokens"]["color"]["wash"]>
> = {
	pending: "accent",
	failed: "error",
};

export function phoneRowSx(status: DisplayStatus, transfer?: TransferTone) {
	const wash = transfer ? transferWash[transfer] : rowWash[status];
	const bgcolor = wash
		? (t: Theme) => t.tokens.color.wash[wash]
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
