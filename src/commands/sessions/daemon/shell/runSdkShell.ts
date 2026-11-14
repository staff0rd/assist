import { randomUUID } from "node:crypto";
import type { SdkShellRow } from "../../shared/SdkShellRow";
import type { Session } from "../createSession";
import { daemonLog } from "../daemonLog";
import { quoteForLog } from "../sdk/createSdkMessageQueue";
import { spawnShellCommand } from "./spawnShellCommand";
import { trackShellCommand, untrackShellCommand } from "./stopShellCommand";
import { watchShellChild } from "./watchShellChild";

/* why: `!` commands from the SDK composer run beside the claude query, not
 * through it, so no turn starts; their output is held on the session until
 * the next message reaches Claude (takeHeldShellResults). */
export function runSdkShell(
	session: Session,
	command: string,
	notify: () => void,
): void {
	const row: SdkShellRow = {
		id: randomUUID().slice(0, 8),
		command,
		output: [],
		state: "running",
		startedAt: Date.now(),
	};
	const label = `session ${session.id} shell ${row.id}`;
	session.sdkShell = [...(session.sdkShell ?? []), row];
	session.lastUserMessage = `! ${command}`;
	const cwd = session.cwd ?? process.cwd();
	const child = spawnShellCommand(command, cwd, session.id);
	daemonLog(
		`${label} started: pid ${child.pid ?? "none"} in ${cwd}: ${quoteForLog(command)}`,
	);
	trackShellCommand(session.id, row.id, child);
	watchShellChild(child, row, label, () => {
		if (row.state !== "running") untrackShellCommand(session.id, row.id);
		notify();
	});
	notify();
}
