import type { SessionInfo } from "../../../../types";
import { useStopShellCommand } from "../TranscriptArea/useStopShellCommand";

/* why: Esc stops the newest running `!` command before it would stop Claude's
 * turn, so a long command can be cut short without interrupting Claude. */
export function useStopRunningShell(
	session: SessionInfo,
): (() => void) | undefined {
	const stopShell = useStopShellCommand();
	const running = session.sdkShell
		?.filter((row) => row.state === "running")
		.at(-1);
	if (!stopShell || !running) return undefined;
	return () => stopShell(session.id, running.id);
}
