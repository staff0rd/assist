import { RepoFilterRow } from "./RepoFilterRow";
import { SessionFormControls } from "./SessionFormControls";
import type { HistoricalSession, RunConfigInfo } from "./types";
import { useNewSessionForm } from "./useNewSessionForm";
import { useRepoSelection } from "./useRepoSelection";

export function NewSessionForm({
	currentCwd,
	history,
	runConfigs,
	onCreate,
	onCreateRun,
	onRequestRunConfigs,
}: {
	currentCwd: string;
	history: HistoricalSession[];
	runConfigs: RunConfigInfo[];
	onCreate: (prompt: string, cwd: string) => void;
	onCreateRun: (runName: string, runArgs: string[], cwd?: string) => void;
	onRequestRunConfigs: (cwd: string) => void;
}) {
	const { repos, selectedCwd, setSelectedCwd } = useRepoSelection(
		currentCwd,
		history,
	);
	const form = useNewSessionForm({
		runConfigs,
		selectedCwd,
		onCreate,
		onCreateRun,
		onRequestRunConfigs,
	});
	const hasRepo = selectedCwd !== "";

	return (
		<form
			onSubmit={form.handleSubmit}
			style={{
				padding: 12,
				borderTop: "1px solid #333",
				display: "flex",
				flexDirection: "column",
				gap: 8,
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
				<div style={{ color: "#888", fontSize: 12, padding: "6px 0" }}>
					Select a repo above to create a session
				</div>
			)}
		</form>
	);
}
