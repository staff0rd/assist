import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import type { ItemUsageOriginCount } from "../../../../shared/db/countItemUsageByOrigin";
import type { UsageItemStatus } from "./fetchUsageItems";
import { UsageItemRepoFilter } from "./UsageItemRepoFilter";
import { UsageItemStatusFilter } from "./UsageItemStatusFilter";

const rowSx = {
	display: "flex",
	alignItems: "center",
	gap: 2,
	flexWrap: "wrap",
	mb: 2,
} as const;

const note =
	"Repos show their bare name, or org/repo when two share one. Totals sum every phase's recorded usage.";

export function UsageItemsFilterRow({
	origins,
	origin,
	onOriginChange,
	status,
	onStatusChange,
}: {
	origins: ItemUsageOriginCount[];
	origin: string;
	onOriginChange: (origin: string) => void;
	status: UsageItemStatus;
	onStatusChange: (status: UsageItemStatus) => void;
}) {
	return (
		<Box sx={rowSx}>
			<UsageItemStatusFilter status={status} onChange={onStatusChange} />
			<UsageItemRepoFilter
				origins={origins}
				origin={origin}
				onChange={onOriginChange}
			/>
			<Typography variant="caption" color="text.disabled">
				{note}
			</Typography>
		</Box>
	);
}
