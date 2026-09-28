import { StartServerButton } from "./ServerRunControls/StartServerButton";
import { ServerRunDropdown } from "../ServerRunDropdown";
import { StopCardActivation } from "../StopCardActivation";
import type { SessionInfo } from "../../types";
import { useServerActionsContext } from "../useServerActionsContext";
import { useServerRuns } from "../useServerRuns";

export function ServerRunControls({ session }: { session: SessionInfo }) {
	const runs = useServerRuns(session.cwd);
	const { onStart } = useServerActionsContext();
	if (runs.length > 2)
		return (
			<StopCardActivation>
				<ServerRunDropdown
					runs={runs}
					onSelect={(runName) =>
						onStart(runName, session.cwd, undefined, session.id)
					}
				/>
			</StopCardActivation>
		);
	return (
		<>
			{runs.map((r) => (
				<StartServerButton
					key={r.name}
					runName={r.name}
					cwd={session.cwd}
					launchedFrom={session.id}
				/>
			))}
		</>
	);
}
