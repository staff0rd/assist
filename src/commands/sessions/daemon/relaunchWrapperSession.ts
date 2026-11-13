import { announceFreshRestart } from "./announceFreshRestart";
import { assistResumeArgs } from "./assistResumeArgs";
import type { Session } from "./createSession";
import { daemonLog } from "./daemonLog";
import type { RestoreStatus } from "./deriveRestoreStatus";
import type { PersistedSession } from "./loadPersistedSessions";
import type { restoreBase } from "./restoreBase";
import { restoreResumePlan } from "./restoreResumePlan";
import { conversationResumeOutcome } from "./conversationResumeOutcome";
import { resumedRunEnv } from "./resumedRunEnv";
import { runningSession, waitingSession } from "./runningSession";
import { spawnAssistProcess } from "./spawnAssistProcess";

export function relaunchWrapperSession(
	id: string,
	persisted: PersistedSession & { assistArgs: string[] },
	base: ReturnType<typeof restoreBase>,
	status: RestoreStatus,
): Session {
	const resume = conversationResumeOutcome(persisted);
	const resumeSessionId = resume.id;
	const plan = restoreResumePlan(
		persisted,
		resumeSessionId ? status : "running",
	);
	daemonLog(
		`session ${id} relaunching wrapper (${resumeSessionId ? `resume ${resumeSessionId}` : `fresh: ${resume.reason}`})`,
	);
	const pty = spawnAssistProcess(
		assistResumeArgs({ assistArgs: persisted.assistArgs, resumeSessionId }),
		persisted.cwd,
		id,
		resumedRunEnv(persisted.activity?.itemId, plan),
	);
	const session = plan.idle
		? waitingSession(base, persisted, pty)
		: runningSession(base, persisted, pty);
	if (resume.reason) announceFreshRestart(session, new Set(), resume.reason);
	return session;
}
