import type { Session } from "./createSession";
import { daemonLog } from "./daemonLog";
import type { PersistedSession } from "./loadPersistedSessions";
import type { restoreBase } from "./restoreBase";
import { runningSession } from "./runningSession";
import { spawnPty } from "./spawnPty";
import { seedWatcherScrollback } from "./worktree/seedWatcherScrollback";

type ConsoleWatcher = PersistedSession & { assistArgs: string[] };

export function isConsoleWatcher(
	persisted: PersistedSession,
): persisted is ConsoleWatcher {
	return (
		persisted.watcher === true &&
		persisted.commandType === "assist" &&
		!!persisted.assistArgs
	);
}

export function relaunchConsoleWatcher(
	id: string,
	persisted: ConsoleWatcher,
	base: ReturnType<typeof restoreBase>,
): Session {
	const command = ["assist", ...persisted.assistArgs];
	daemonLog(
		`relaunching watcher session ${id} running ${command.join(" ")} in ${persisted.cwd ?? "(no cwd)"}`,
	);
	const session = runningSession(
		base,
		persisted,
		spawnPty(command, persisted.cwd, id),
	);
	if (persisted.cwd)
		session.scrollback = seedWatcherScrollback(
			persisted.cwd,
			"daemon restarted; watcher relaunched",
		);
	return session;
}
