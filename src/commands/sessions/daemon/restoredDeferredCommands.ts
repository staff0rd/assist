import { daemonLog } from "./daemonLog";
import type { PendingDeferredCommand } from "./pendingDeferredCommandSchema";
import type { PersistedSession } from "./persistedSessionSchema";

export function restoredDeferredCommands(
	id: string,
	persisted: PersistedSession,
): PendingDeferredCommand[] | undefined {
	const commands = (persisted.deferredCommands ?? []).filter(
		(command): command is PendingDeferredCommand => {
			if (typeof command !== "string") return true;
			daemonLog(
				`defer-command ${command} dropped on restore: session ${id} has only its legacy label, nothing to re-run`,
			);
			return false;
		},
	);
	return commands.length > 0 ? commands : undefined;
}
