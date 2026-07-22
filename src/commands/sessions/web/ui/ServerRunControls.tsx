import { StartServerButton } from "./StartServerButton";
import { StopServerButton } from "./StopServerButton";
import type { SessionInfo } from "./types";
import { useServerRuns } from "./useServerRuns";

export function ServerRunControls({ session }: { session: SessionInfo }) {
	const runs = useServerRuns(session.cwd);
	const live = session.status !== "done" && session.status !== "error";
	const servingRun =
		session.commandType === "run" && session.server && live
			? session.runName
			: undefined;
	return (
		<>
			{runs.map((r) =>
				servingRun === r.name ? (
					<StopServerButton key={r.name} id={session.id} />
				) : (
					<StartServerButton key={r.name} runName={r.name} cwd={session.cwd} />
				),
			)}
		</>
	);
}
