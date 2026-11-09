import type { HarnessAdapter } from "../../../shared/harnessAdapters/types";
import type { Session } from "./createSession";
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
		design: persisted.design,
		auto: persisted.auto,
	});
	return plan.idle
		? waitingSession(base, persisted, pty)
		: runningSession(base, persisted, pty);
}
