import { StartServerButton } from "./ServerRunControls/StartServerButton";
import type { SessionInfo } from "../../types";
import { useServerRuns } from "../useServerRuns";

export function ServerRunControls({ session }: { session: SessionInfo }) {
	const runs = useServerRuns(session.cwd);
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
