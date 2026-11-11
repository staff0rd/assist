import type { Theme } from "@mui/material/styles";
import type { NodeStatus } from "../nodeStatus";

export const nodeArticleSx =
	(attention: NodeStatus["attention"]) => (t: Theme) => ({
		"& + &": { borderTop: 1, borderColor: "divider" },
		boxShadow: attention
			? `inset 3px 0 0 ${t.palette[attention].main}`
			: "none",
	});

export const nodeRowSx = {
	display: "grid",
	gridTemplateColumns: {
		xs: "28px minmax(0,1fr) auto",
		sm: "28px minmax(0,1.5fr) minmax(0,1fr) minmax(0,1.6fr) auto",
	},
	alignItems: "center",
	columnGap: 1.5,
	rowGap: 0.75,
	px: 2,
	py: 1.25,
} as const;

export const nodeCellSx = {
	gridColumn: { xs: "2 / -1", sm: "auto" },
	minWidth: 0,
};

export const nodeDetailSx = { mx: 2, mb: 1.5, ml: { xs: 2, sm: 7 } };
