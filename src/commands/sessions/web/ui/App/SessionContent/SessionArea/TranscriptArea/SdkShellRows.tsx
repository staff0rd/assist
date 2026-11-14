import type { SessionInfo } from "../../../../types";
import { ShellRow } from "./ShellRow";

export function SdkShellRows({ session }: { session: SessionInfo }) {
	return session.sdkShell?.map((row) => (
		<ShellRow
			key={row.id}
			command={row.command}
			output={row.output}
			status={row.state}
			startedAt={row.startedAt}
			exitCode={row.exitCode}
			durationMs={row.durationMs}
		/>
	));
}
