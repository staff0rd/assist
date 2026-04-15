import { NewSessionForm } from "./NewSessionForm";
import { SessionList } from "./SessionList";
import type { HistoricalSession, RunConfigInfo, SessionInfo } from "./types";

export type RunProps = {
	configs: RunConfigInfo[];
	create: (runName: string, runArgs: string[], cwd?: string) => void;
	requestConfigs: (cwd: string) => void;
};

export function ActiveTab({
	sessions,
	activeId,
	currentCwd,
	history,
	run,
	onSelect,
	onCreate,
	onRetry,
	onDismiss,
}: {
	sessions: SessionInfo[];
	activeId: string | null;
	currentCwd: string;
	history: HistoricalSession[];
	run: RunProps;
	onSelect: (id: string) => void;
	onCreate: (prompt: string, cwd: string) => void;
	onRetry: (id: string) => void;
	onDismiss: (id: string) => void;
}) {
	return (
		<>
			<SessionList
				sessions={sessions}
				activeId={activeId}
				onSelect={onSelect}
				onRetry={onRetry}
				onDismiss={onDismiss}
			/>
			<NewSessionForm
				currentCwd={currentCwd}
				history={history}
				runConfigs={run.configs}
				onCreate={onCreate}
				onCreateRun={run.create}
				onRequestRunConfigs={run.requestConfigs}
			/>
		</>
	);
}
