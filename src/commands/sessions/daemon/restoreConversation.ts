import { sessionModeLaunch } from "./sessionModeLaunch";
import type { HarnessAdapter } from "../../../shared/harnessAdapters/types";
import type { Session } from "./createSession";
import { daemonLog } from "./daemonLog";
import type { RestoreStatus } from "./deriveRestoreStatus";
import type { PersistedSession } from "./loadPersistedSessions";
import { relaunchUnwrittenConversation } from "./relaunchUnwrittenConversation";
import type { restoreBase } from "./restoreBase";
import { restoreResumePlan, resumePrompt } from "./restoreResumePlan";
import { runningSession, waitingSession } from "./runningSession";

type RestoreBase = ReturnType<typeof restoreBase>;

export function restoreConversation(
	adapter: HarnessAdapter,
	restored: { id: string; persisted: PersistedSession; base: RestoreBase },
	status: RestoreStatus,
): Session {
	const { id, persisted, base } = restored;
	const plan = restoreResumePlan(persisted, status);
	const resumeId = adapter.conversation.findResumable(persisted);
	if (!resumeId) return relaunchUnwrittenConversation(adapter, restored, plan);
	const pty = adapter.interactive({
		resumeId,
		prompt: resumePrompt(plan),
		cwd: persisted.cwd,
		sessionId: id,
		...sessionModeLaunch(adapter, persisted),
	});
	const session = plan.idle
		? waitingSession(base, persisted, pty)
		: runningSession(base, persisted, pty);
	if (!pty?.sdk) return session;
	daemonLog(
		`session ${id} sdk resuming claude session ${resumeId} after daemon restart: composer locked until the resume completes`,
	);
	return { ...session, sdkResuming: true };
}
