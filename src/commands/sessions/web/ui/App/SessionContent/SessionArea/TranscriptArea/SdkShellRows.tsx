import type { SessionInfo } from "../../../../types";
import { ShellRow } from "./ShellRow";
import { useStopShellCommand } from "./useStopShellCommand";

export function SdkShellRows({ session }: { session: SessionInfo }) {
	const stopShell = useStopShellCommand();
	return session.sdkShell?.map((row) => (
		<ShellRow
			key={row.id}
			command={row.command}
			output={row.output}
			status={row.state}
			startedAt={row.startedAt}
			exitCode={row.exitCode}
			durationMs={row.durationMs}
			stopped={row.stopped}
			onStop={stopShell && (() => stopShell(session.id, row.id))}
		/>
	));
}
