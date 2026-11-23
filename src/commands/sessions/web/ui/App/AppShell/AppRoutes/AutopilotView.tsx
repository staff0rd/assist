import { toNodeSessionId } from "../../../../../daemon/links/splitNodeSessionId";
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
	const { state, refresh } = useAutopilotStatus(selectedCwd);
	const target = state.loading ? { cwd: selectedCwd } : state.target;
	const actions = useAutopilotActions(target.cwd, target.node, refresh);
	const activate = useActivateSession(selectSession);
	const status = state.loading ? null : state.status;
	const via = state.loading ? undefined : state.via;
	return (
		<PageShell
			loading={state.loading}
			header={
				<AutopilotHeader
					cwd={selectedCwd}
					status={status}
					via={via}
					busy={actions.busy}
					onAction={(action) => void actions.run(action)}
				/>
			}
		>
			<AutopilotBody
				cwd={selectedCwd}
				status={status}
				items={state.loading ? [] : state.items}
				busy={actions.busy}
				onStop={(itemId) => void actions.run("stop", itemId)}
				onResume={(itemId) => void actions.run("resume-item", itemId)}
				onOpen={(id) =>
					activate(target.node ? toNodeSessionId(target.node, id) : id)
				}
				problem={actions.error ?? (state.loading ? undefined : state.error)}
			/>
		</PageShell>
	);
}
