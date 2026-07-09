import type { PersistedSession } from "./loadPersistedSessions";

export function restoreBase(id: string, persisted: PersistedSession) {
	return {
		id,
		name: persisted.name,
		title: persisted.title,
		subtitle: persisted.subtitle,
		commandType: persisted.commandType,
		scrollback: "",
		cwd: persisted.cwd,
		assistArgs: persisted.assistArgs,
		initialPrompt: persisted.initialPrompt,
	};
}
