import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { useState } from "react";
import { ConfigGroupCard } from "./ConfigView/ConfigGroupCard";
import { ConfigFilterBar } from "./ConfigView/ConfigFilterBar";
import { configNoMatchMessage } from "./ConfigView/configNoMatchMessage";
import { ErrorSnackbar } from "../ErrorSnackbar";
import { PageShell } from "./PageShell";
import { useConfigEntries } from "./ConfigView/useConfigEntries";
import { useConfigFilters } from "./ConfigView/useConfigFilters";
import { useRepoSelectionContext } from "../useRepoSelectionContext";

export function ConfigView() {
	const { selectedCwd } = useRepoSelectionContext();
	const { entries, loading, error, reload } = useConfigEntries(selectedCwd);
	const [saveError, setSaveError] = useState<string | null>(null);
	const { search, setSearch, scopes, toggle, groups } =
		useConfigFilters(entries);

	return (
		<PageShell
			loading={loading}
			title="Config"
			isEmpty={entries.length === 0}
			emptyMessage={error ?? "No config keys."}
		>
			<Typography variant="caption" color="text.secondary">
				Effective config for {selectedCwd}
			</Typography>
			<ConfigFilterBar
				entries={entries}
				search={search}
				onSearchChange={setSearch}
				scopes={scopes}
				onToggleScope={toggle}
			/>
			{groups.length === 0 ? (
				<Typography color="text.secondary" align="center" sx={{ py: 6 }}>
					{configNoMatchMessage(search, scopes)}
				</Typography>
			) : (
				<Stack spacing={2} sx={{ mt: 2 }}>
					{groups.map((group) => (
						<ConfigGroupCard
							key={group.name}
							group={group}
							cwd={selectedCwd}
							onSaved={reload}
							onError={setSaveError}
						/>
					))}
				</Stack>
			)}
			<ErrorSnackbar error={saveError} onClose={() => setSaveError(null)} />
		</PageShell>
	);
}
