import type { Session } from "./createSession";
import type { PersistedSession } from "./loadPersistedSessions";
import type { restoreBase } from "./restoreBase";
import { restoreResumePlan, resumePrompt } from "./restoreResumePlan";
import { runningSession, waitingSession } from "./runningSession";
import { spawnCodex } from "./spawnCodex";

type RestoreBase = ReturnType<typeof restoreBase>;

export function restoreCodexSession(
	id: string,
	persisted: PersistedSession,
	base: RestoreBase,
	idle: boolean,
): Session | null {
	if (!persisted.harnessSessionId) return null;
	const plan = restoreResumePlan(persisted, idle);
	const pty = spawnCodex({
		resumeSessionId: persisted.harnessSessionId,
		prompt: resumePrompt(plan),
		cwd: persisted.cwd,
		sessionId: id,
	});
	return plan.idle
		? waitingSession(base, persisted, pty)
		: runningSession(base, persisted, pty);
}
