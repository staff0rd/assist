import Paper from "@mui/material/Paper";
import type { ItemUsageStats } from "../../../../shared/db/itemUsageStats";
import { usageItemStatFigures } from "./usageItemStatFigures";
import { UsageStat } from "./UsageStat";

const bandSx = {
	display: "flex",
	flexDirection: { xs: "column", sm: "row" },
	mb: 3,
	"& > *": { flex: 1, minWidth: 0, p: 2 },
	"& > * + *": {
		borderColor: "divider",
		borderTop: { xs: 1, sm: 0 },
		borderLeft: { xs: 0, sm: 1 },
	},
} as const;

export function UsageItemStatBand({ summary }: { summary: ItemUsageStats }) {
	const figures = usageItemStatFigures(summary);

	return (
		<Paper sx={bandSx}>
			<UsageStat
				label="Items with recorded usage"
				value={figures.items}
				foot={figures.itemsFoot}
			/>
			<UsageStat label="Median phases" value={figures.phases} />
			<UsageStat
				label="Median active time"
				value={figures.active}
				foot={figures.activeFoot}
			/>
			<UsageStat
				label="Median tokens"
				value={figures.tokens}
				foot={figures.tokensFoot}
			/>
		</Paper>
	);
}
