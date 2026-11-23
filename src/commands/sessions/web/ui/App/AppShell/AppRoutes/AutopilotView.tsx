import { useRepoSelectionContext } from "../../../useRepoSelectionContext";
import { useActivateSession } from "../../../useActivateSession";
import { PageShell } from "../../PageShell";
import { AutopilotBody } from "./AutopilotView/AutopilotBody";
import { AutopilotHeader } from "./AutopilotView/AutopilotHeader";
import { useAutopilotActions } from "./AutopilotView/useAutopilotActions";
import { useAutopilotStatus } from "./AutopilotView/useAutopilotStatus";

export function AutopilotView({
	selectSession,
}: {
	selectSession: (id: string) => void;
}) {
	const { selectedCwd } = useRepoSelectionContext();
	const { state, refresh, node } = useAutopilotStatus(selectedCwd);
	const actions = useAutopilotActions(selectedCwd, node, refresh);
	const activate = useActivateSession(selectSession);
	const status = state.loading ? null : state.status;
	return (
		<PageShell
			loading={state.loading}
			header={
				<AutopilotHeader
					cwd={selectedCwd}
					status={status}
					busy={actions.busy}
					onAction={(action) => void actions.run(action)}
				/>
			}
		>
			<AutopilotBody
				status={status}
				items={state.loading ? [] : state.items}
				busy={actions.busy}
				onStop={(itemId) => void actions.run("stop", itemId)}
				onOpen={activate}
				problem={actions.error ?? (state.loading ? undefined : state.error)}
			/>
		</PageShell>
	);
}
