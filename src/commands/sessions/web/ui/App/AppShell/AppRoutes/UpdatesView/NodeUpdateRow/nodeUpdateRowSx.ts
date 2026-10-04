import type { Theme } from "@mui/material/styles";
import type { UpdateStateKind } from "../updateState";

const accent: Partial<Record<UpdateStateKind, "warning" | "error">> = {
	ready: "warning",
	diverged: "error",
};

export const nodeUpdateRowSx = (kind: UpdateStateKind) => (t: Theme) => {
	const tone = accent[kind];
	return {
		display: "grid",
		gridTemplateColumns: {
			xs: "28px minmax(0,1fr)",
			sm: "28px minmax(0,1.3fr) minmax(0,1fr) minmax(0,1.6fr)",
		},
		alignItems: "center",
		columnGap: 1.5,
		rowGap: 1,
		px: 2,
		py: 1.5,
		boxShadow: tone ? `inset 3px 0 0 ${t.palette[tone].main}` : "none",
	};
};
