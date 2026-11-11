import Stack from "@mui/material/Stack";
import type { ConfigEntry } from "../../../../../config/readConfigEntries";
import type { ConfigSource } from "../../../../../config/resolveConfigSources";
import { ConfigKeySearchInput } from "./ConfigKeySearchInput";
import { ConfigScopeFilter } from "./ConfigScopeFilter";

export function ConfigFilterBar({
	entries,
	search,
	onSearchChange,
	scopes,
	onToggleScope,
}: {
	entries: ConfigEntry[];
	search: string;
	onSearchChange: (search: string) => void;
	scopes: ReadonlySet<ConfigSource>;
	onToggleScope: (source: ConfigSource) => void;
}) {
	return (
		<Stack
			direction="row"
			spacing={2}
			useFlexGap
			sx={{ mt: 1, flexWrap: "wrap", alignItems: "center" }}
		>
			<ConfigKeySearchInput search={search} onChange={onSearchChange} />
			<ConfigScopeFilter
				entries={entries}
				selected={scopes}
				onToggle={onToggleScope}
			/>
		</Stack>
	);
}
