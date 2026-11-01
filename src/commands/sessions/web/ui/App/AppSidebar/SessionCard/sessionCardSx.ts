import { type SxProps, type Theme } from "@mui/material/styles";
import type { DisplayStatus } from "../../../displayStatus";
import { selectionSx } from "./sessionCardSx/selectionSx";

const attentionWash: Partial<
	Record<DisplayStatus, keyof Theme["tokens"]["color"]["wash"]>
> = {
	waiting: "warning",
	question: "accent",
	check: "check",
	error: "error",
};

function cardBackground(t: Theme, active: boolean, status: DisplayStatus) {
	const wash = attentionWash[status];
	if (active) return t.palette.action.selected;
	if (wash) return t.tokens.color.wash[wash];
	return "transparent";
}

export function sessionCardSx(
	active: boolean,
	status: DisplayStatus,
): SxProps<Theme> {
	return (t) => ({
		display: "grid",
		columnGap: 1,
		alignItems: "center",
		textAlign: "left",
		...selectionSx(t, active),
		bgcolor: cardBackground(t, active, status),
		cursor: active ? "default" : "pointer",
		transition: "background 0.2s ease, border-color 0.2s ease",
		"&:hover": !active ? { bgcolor: "action.hover" } : undefined,
	});
}
