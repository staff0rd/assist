import { assistResumeArgs } from "./assistResumeArgs";
import type { Session } from "./createSession";
import { daemonLog } from "./daemonLog";
import type { RestoreStatus } from "./deriveRestoreStatus";
import type { PersistedSession } from "./loadPersistedSessions";
import type { restoreBase } from "./restoreBase";
import { restoreResumePlan } from "./restoreResumePlan";
import { resumableConversationId } from "./resumableConversationId";
import { resumedRunEnv } from "./resumedRunEnv";
import { runningSession, waitingSession } from "./runningSession";
import { spawnPty } from "./spawnPty";

export function relaunchWrapperSession(
	id: string,
	persisted: PersistedSession & { assistArgs: string[] },
	base: ReturnType<typeof restoreBase>,
	status: RestoreStatus,
): Session {
	const resumeSessionId = resumableConversationId(persisted);
	const plan = restoreResumePlan(
		persisted,
		resumeSessionId ? status : "running",
	);
	daemonLog(
		`session ${id} relaunching wrapper (${resumeSessionId ? `resume ${resumeSessionId}` : "fresh"})`,
	);
	const pty = spawnPty(
		assistResumeArgs({ assistArgs: persisted.assistArgs, resumeSessionId }),
		persisted.cwd,
		id,
		resumedRunEnv(persisted.activity?.itemId, plan),
	);
	return plan.idle
		? waitingSession(base, persisted, pty)
		: runningSession(base, persisted, pty);
}
