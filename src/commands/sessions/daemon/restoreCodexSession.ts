import type { Session } from "./createSession";
import type { RestoreStatus } from "./deriveRestoreStatus";
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
	status: RestoreStatus,
): Session | null {
	if (!persisted.harnessSessionId) return null;
	const plan = restoreResumePlan(persisted, status);
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
