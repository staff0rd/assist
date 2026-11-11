import Chip from "@mui/material/Chip";
import Stack from "@mui/material/Stack";
import type { ConfigEntry } from "../../../../../config/readConfigEntries";
import type { ConfigSource } from "../../../../../config/resolveConfigSources";
import { configSourceLabel, configSources } from "./configSourceLabel";

export function ConfigScopeFilter({
	entries,
	selected,
	onToggle,
}: {
	entries: ConfigEntry[];
	selected: ReadonlySet<ConfigSource>;
	onToggle: (source: ConfigSource) => void;
}) {
	return (
		<Stack
			direction="row"
			spacing={1}
			useFlexGap
			sx={{ flexWrap: "wrap" }}
			role="group"
			aria-label="Filter config keys by scope"
		>
			{configSources.map((source) => {
				const active = selected.has(source);
				const count = entries.filter((e) => e.source === source).length;
				return (
					<Chip
						key={source}
						size="small"
						clickable
						color={active ? "primary" : "default"}
						variant={active ? "filled" : "outlined"}
						aria-pressed={active}
						label={`${configSourceLabel(source)} (${count})`}
						onClick={() => onToggle(source)}
					/>
				);
			})}
		</Stack>
	);
}
