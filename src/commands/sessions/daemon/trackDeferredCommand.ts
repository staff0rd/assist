import type { PendingDeferredCommand } from "./pendingDeferredCommandSchema";
import type { Session } from "./types";

export function trackDeferredCommand(
	session: Session,
	command: PendingDeferredCommand,
): void {
	session.deferredCommands = [...(session.deferredCommands ?? []), command];
}

export function untrackDeferredCommand(
	session: Session,
	command: PendingDeferredCommand,
): void {
	const pending = session.deferredCommands ?? [];
	if (!pending.includes(command)) return;
	const rest = pending.filter((c) => c !== command);
	session.deferredCommands = rest.length > 0 ? rest : undefined;
}
