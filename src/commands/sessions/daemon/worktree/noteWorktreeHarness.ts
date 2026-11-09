import { resolveHarness } from "../../../../shared/harnessLabel";
import type { Session } from "../createSession";
import { daemonLog } from "../daemonLog";
import { recordWorktreeHarness } from "./readWorktreeRegistry";

export function noteWorktreeHarness(session: Session): void {
	const path = session.worktree?.path;
	if (!path) return;
	const harness =
		session.commandType === "claude"
			? resolveHarness(session.harness)
			: session.harness;
	if (!harness) return;
	try {
		recordWorktreeHarness(path, harness);
	} catch (error) {
		daemonLog(
			`worktree ${path} harness ${harness} not recorded for session ${session.id}: ${error instanceof Error ? error.message : String(error)}`,
		);
	}
}
