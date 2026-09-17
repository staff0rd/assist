import type { PersistedSession } from "./loadPersistedSessions";
import { restoredAutoAdvance } from "./restoredAutoAdvance";

export function restoreBase(id: string, persisted: PersistedSession) {
	return {
		id,
		name: persisted.name,
		title: persisted.title,
		generatedTitle: persisted.generatedTitle,
		subtitle: persisted.subtitle,
		commandType: persisted.commandType,
		harness: persisted.harness,
		harnessSessionId: persisted.harnessSessionId,
		scrollback: "",
		cwd: persisted.cwd,
		assistArgs: persisted.assistArgs,
		initialPrompt: persisted.initialPrompt,
		starred: persisted.watcher ? false : persisted.starred,
		watcher: persisted.watcher,
		design: persisted.design,
		auto: persisted.auto,
		autoRun: persisted.autoRun,
		autoAdvance: restoredAutoAdvance(id, persisted),
		reviewStarted: persisted.reviewStarted,
		launchedFrom: persisted.launchedFrom,
	};
}
