import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { useState } from "react";
import { useSearchParams } from "react-router";
import { ConfigGroupCard } from "./ConfigView/ConfigGroupCard";
import { ConfigKeySearchInput } from "./ConfigView/ConfigKeySearchInput";
import { ErrorSnackbar } from "./ErrorSnackbar";
import { filterConfigEntries } from "./ConfigView/filterConfigEntries";
import { groupConfigEntries } from "./ConfigView/groupConfigEntries";
import { PageShell } from "./PageShell";
import { useConfigEntries } from "./ConfigView/useConfigEntries";
import { useRepoSelectionContext } from "../useRepoSelectionContext";

export function ConfigView() {
	const { selectedCwd } = useRepoSelectionContext();
	const { entries, loading, error, reload } = useConfigEntries(selectedCwd);
	const [saveError, setSaveError] = useState<string | null>(null);
	const [searchParams] = useSearchParams();
	const [search, setSearch] = useState(searchParams.get("search") ?? "");
	const groups = groupConfigEntries(filterConfigEntries(entries, search));

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
			<Stack sx={{ mt: 1 }}>
				<ConfigKeySearchInput search={search} onChange={setSearch} />
			</Stack>
			{groups.length === 0 ? (
				<Typography color="text.secondary" align="center" sx={{ py: 6 }}>
					No keys or descriptions match “{search.trim()}”.
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
