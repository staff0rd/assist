import type { Session } from "./createSession";
import type { RestoreStatus } from "./deriveRestoreStatus";
import { hasTranscriptOnDisk } from "./hasTranscriptOnDisk";
import type { PersistedSession } from "./loadPersistedSessions";
import type { restoreBase } from "./restoreBase";
import { restoreResumePlan, resumePrompt } from "./restoreResumePlan";
import { runningSession, waitingSession } from "./runningSession";
import { spawnClaude } from "./spawnClaude";

type RestoreBase = ReturnType<typeof restoreBase>;

export function resumeViaClaude(
	id: string,
	persisted: PersistedSession,
	base: RestoreBase,
	status: RestoreStatus,
): Session {
	const mode = { design: persisted.design, auto: persisted.auto };
	const plan = restoreResumePlan(persisted, status);
	const pty = spawnClaude(
		hasTranscriptOnDisk(persisted)
			? {
					resumeSessionId: persisted.claudeSessionId,
					prompt: resumePrompt(plan),
					cwd: persisted.cwd,
					sessionId: id,
					...mode,
				}
			: {
					claudeSessionId: persisted.claudeSessionId,
					cwd: persisted.cwd,
					sessionId: id,
					...mode,
				},
	);
	return plan.idle
		? waitingSession(base, persisted, pty)
		: runningSession(base, persisted, pty);
}
