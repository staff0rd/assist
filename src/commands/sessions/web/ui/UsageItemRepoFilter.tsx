import MenuItem from "@mui/material/MenuItem";
import TextField from "@mui/material/TextField";
import { useMemo } from "react";
import type { ItemUsageOriginCount } from "../../../../shared/db/countItemUsageByOrigin";
import { originDisplayLabels } from "../../../backlog/originDisplayLabels";
import { ALL_REPOS } from "./fetchUsageItems";

export function UsageItemRepoFilter({
	origins,
	origin,
	onChange,
}: {
	origins: ItemUsageOriginCount[];
	origin: string;
	onChange: (origin: string) => void;
}) {
	const labels = useMemo(
		() => originDisplayLabels(origins.map((row) => row.origin)),
		[origins],
	);
	const allCount = origins.reduce((sum, row) => sum + row.count, 0);

	return (
		<TextField
			select
			size="small"
			label="Repo"
			value={origin}
			onChange={(event) => onChange(event.target.value)}
			sx={{ minWidth: 220 }}
		>
			<MenuItem value={ALL_REPOS}>{`All repos (${allCount})`}</MenuItem>
			{origins.map((row) => (
				<MenuItem key={row.origin} value={row.origin}>
					{`${labels.get(row.origin) ?? row.origin} (${row.count})`}
				</MenuItem>
			))}
		</TextField>
	);
}
