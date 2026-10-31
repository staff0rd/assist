import type { Theme } from "@mui/material/styles";
import { tokenBadgeSx } from "./tokenBadgeSx";

export const reviewPhaseBadgeSx = [
	tokenBadgeSx("primary"),
	(t: Theme) => ({
		bgcolor: t.palette.primary.main,
		borderColor: t.palette.primary.main,
		color: t.palette.primary.contrastText,
	}),
];
