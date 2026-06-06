import { NewSessionForm } from "./NewSessionForm";
import { SessionList } from "./SessionList";
import type { RunConfigInfo, SessionInfo } from "./types";

export type RunProps = {
	configs: RunConfigInfo[];
	create: (runName: string, runArgs: string[], cwd?: string) => void;
	requestConfigs: (cwd: string) => void;
};

export function ActiveTab({
	sessions,
	activeId,
	run,
	onSelect,
	onCreate,
	onCreateAssist,
	onRetry,
	onDismiss,
}: {
	sessions: SessionInfo[];
	activeId: string | null;
	run: RunProps;
	onSelect: (id: string) => void;
	onCreate: (prompt: string, cwd: string) => void;
	onCreateAssist: (args: string[], cwd?: string) => void;
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
				runConfigs={run.configs}
				onCreate={onCreate}
				onCreateRun={run.create}
				onCreateAssist={onCreateAssist}
				onRequestRunConfigs={run.requestConfigs}
			/>
		</>
	);
}
