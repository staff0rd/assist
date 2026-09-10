import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import type { ItemUsageOriginCount } from "../../../../shared/db/countItemUsageByOrigin";
import { UsageItemRepoFilter } from "./UsageItemRepoFilter";

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
	onChange,
}: {
	origins: ItemUsageOriginCount[];
	origin: string;
	onChange: (origin: string) => void;
}) {
	return (
		<Box sx={rowSx}>
			<UsageItemRepoFilter
				origins={origins}
				origin={origin}
				onChange={onChange}
			/>
			<Typography variant="caption" color="text.disabled">
				{note}
			</Typography>
		</Box>
	);
}
