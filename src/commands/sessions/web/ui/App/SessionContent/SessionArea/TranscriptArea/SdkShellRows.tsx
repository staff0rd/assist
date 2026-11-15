import type { SessionInfo } from "../../../../types";
import { ShellRow } from "./ShellRow";
import { useStopShellCommand } from "./useStopShellCommand";
import { useDiscardShellResult } from "./useDiscardShellResult";

export function SdkShellRows({ session }: { session: SessionInfo }) {
	const stopShell = useStopShellCommand();
	const discardShell = useDiscardShellResult();
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
			onDiscard={discardShell && (() => discardShell(session.id, row.id))}
		/>
	));
}
