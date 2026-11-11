import type { Theme } from "@mui/material/styles";
import type { LinkState } from "../../../../../../daemon/links/LinkStatus";

const accent: Partial<Record<LinkState, "warning" | "error">> = {
	disconnected: "error",
	"version-blocked": "warning",
};

export const nodeRowSx = (state?: LinkState) => (t: Theme) => {
	const tone = state && accent[state];
	return {
		display: "grid",
		gridTemplateColumns: {
			xs: "12px minmax(0,1fr) auto",
			sm: "12px minmax(0,1.1fr) minmax(0,1.6fr) minmax(0,1fr) 88px",
		},
		alignItems: "center",
		columnGap: 1.5,
		rowGap: 0.5,
		px: 2,
		py: 1.5,
		"& + &": { borderTop: 1, borderColor: "divider" },
		boxShadow: tone ? `inset 3px 0 0 ${t.palette[tone].main}` : "none",
	};
};

export const nodeDetailSx = { gridColumn: { xs: "2 / -1", sm: "2 / -1" } };

export const nodeCellSx = { gridColumn: { xs: "2", sm: "auto" }, minWidth: 0 };
