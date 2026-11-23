import { toNodeSessionId } from "../../../../../daemon/links/splitNodeSessionId";
import { useActivateSession } from "../../../useActivateSession";
import { PageShell } from "../../PageShell";
import { AutopilotBody } from "./AutopilotView/AutopilotBody";
import { AutopilotHeader } from "./AutopilotView/AutopilotHeader";
import { RepoSwitcher } from "./AutopilotView/RepoSwitcher";
import { useAutopilotPage } from "./AutopilotView/useAutopilotPage";

export function AutopilotView({
	selectSession,
}: {
	selectSession: (id: string) => void;
}) {
	const { page, state, target, actions } = useAutopilotPage();
	const activate = useActivateSession(selectSession);
	const loaded = state.loading ? undefined : state;
	return (
		<PageShell
			loading={state.loading}
			header={
				<AutopilotHeader
					cwd={page.cwd}
					status={loaded?.status ?? null}
					via={loaded?.via}
					busy={actions.busy}
					onAction={(action) => void actions.run(action)}
				/>
			}
		>
			<RepoSwitcher repos={page.repos} cwd={page.cwd} onPick={page.pick} />
			<AutopilotBody
				cwd={page.cwd}
				status={loaded?.status ?? null}
				items={loaded?.items ?? []}
				busy={actions.busy}
				onStop={(itemId) => void actions.run("stop", itemId)}
				onResume={(itemId) => void actions.run("resume-item", itemId)}
				onResumeSchedule={() => void actions.run("resume")}
				onOpen={(id) =>
					activate(target.node ? toNodeSessionId(target.node, id) : id)
				}
				problem={actions.error ?? loaded?.error}
			/>
		</PageShell>
	);
}
