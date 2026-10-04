import { WATCHER_ARGS } from "./createWatcherSession";
import { daemonLog } from "./daemonLog";
import type { PersistedSession } from "./loadPersistedSessions";

export function migrateClaudeWatcher(
	id: string,
	persisted: PersistedSession,
): PersistedSession {
	if (!persisted.watcher || persisted.commandType !== "claude")
		return persisted;
	daemonLog(
		`migrating claude /watch watcher session ${id} to assist ${WATCHER_ARGS.join(" ")}`,
	);
	return {
		...persisted,
		name: `assist ${WATCHER_ARGS.join(" ")}`,
		commandType: "assist",
		assistArgs: WATCHER_ARGS,
		initialPrompt: undefined,
		claudeSessionId: undefined,
		harness: undefined,
		harnessSessionId: undefined,
	};
}
