import type { Session } from "./types";

export function trackDeferredCommand(session: Session, command: string): void {
	session.deferredCommands = [...(session.deferredCommands ?? []), command];
}

export function untrackDeferredCommand(
	session: Session,
	command: string,
): void {
	const pending = session.deferredCommands ?? [];
	const index = pending.indexOf(command);
	if (index === -1) return;
	const rest = pending.filter((_, i) => i !== index);
	session.deferredCommands = rest.length > 0 ? rest : undefined;
}
