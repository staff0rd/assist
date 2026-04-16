import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { RepoFilterRow } from "./RepoFilterRow";
import { SessionFormControls } from "./SessionFormControls";
import type { HistoricalSession } from "./types";
import { type FormDeps, useNewSessionForm } from "./useNewSessionForm";
import { useRepoSelection } from "./useRepoSelection";

type Props = Omit<FormDeps, "selectedCwd"> & {
	currentCwd: string;
	history: HistoricalSession[];
};

export function NewSessionForm(props: Props) {
	const { currentCwd, history, runConfigs } = props;
	const { repos, selectedCwd, setSelectedCwd } = useRepoSelection(
		currentCwd,
		history,
	);
	const form = useNewSessionForm({ ...props, selectedCwd });
	const hasRepo = selectedCwd !== "";

	return (
		<Box
			component="form"
			onSubmit={form.handleSubmit}
			sx={{
				p: 1.5,
				borderTop: 1,
				borderColor: "divider",
				display: "flex",
				flexDirection: "column",
				gap: 1,
			}}
		>
			<RepoFilterRow
				repos={repos}
				selectedCwd={selectedCwd}
				onSelectCwd={setSelectedCwd}
				runFilter={form.runFilter}
				onFilterChange={form.setRunFilter}
				showFilter={runConfigs.length > 0}
			/>
			{hasRepo ? (
				<SessionFormControls form={form} totalRunCount={runConfigs.length} />
			) : (
				<Typography variant="caption" color="text.disabled" sx={{ py: 0.75 }}>
					Select a repo above to create a session
				</Typography>
			)}
		</Box>
	);
}
