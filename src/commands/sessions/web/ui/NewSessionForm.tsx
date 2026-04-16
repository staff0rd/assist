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
