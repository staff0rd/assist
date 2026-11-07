import { assistResumeArgs } from "./assistResumeArgs";
import type { Session } from "./createSession";
import { deriveRestoreStatus } from "./deriveRestoreStatus";
import { errorSession } from "./errorSession";
import { hasTranscriptOnDisk } from "./hasTranscriptOnDisk";
import type { PersistedSession } from "./loadPersistedSessions";
import { relaunchHeldSession } from "./relaunchHeldSession";
import { restoreBase } from "./restoreBase";
import { restoreInteractiveSession } from "./restoreInteractiveSession";
import { restoreResumePlan } from "./restoreResumePlan";
import { resumedRunEnv } from "./resumedRunEnv";
import {
	runningSession,
	stoppedSession,
	waitingSession,
} from "./runningSession";
import { spawnPty } from "./spawnPty";
import { isUpdate, updatedSession } from "./updatedSession";
import { needsWrapperRelaunch } from "./needsWrapperRelaunch";

export function restoreSession(
	id: string,
	persisted: PersistedSession,
): Session {
	if (persisted.awaitingSeed) return relaunchHeldSession(id, persisted);

	const base = restoreBase(id, persisted);

	if (persisted.status === "stopped") return stoppedSession(base, persisted);

	if (persisted.status === "error")
		return errorSession(
			id,
			persisted,
			persisted.error ?? "Session exited with an error",
		);

	if (isUpdate(persisted)) return updatedSession(id, persisted);

	const status = deriveRestoreStatus(persisted);

	/* why: `assist backlog run` is a phase-orchestrating wrapper; a bare
	 * `claude --resume` pty never exits on completion, so re-launch the wrapper
	 * so the card reaches "done" and the phase chain continues (#304). Pass the
	 * latest discovered sessionId so the wrapper resumes the interrupted phase's
	 * conversation instead of restarting it from scratch (#300) — unless no
	 * transcript was ever written for it, in which case there is nothing to resume
	 * and the command re-runs from its original prompt (a777). */
	if (needsWrapperRelaunch(persisted)) {
		const resumesWrittenConversation = hasTranscriptOnDisk(persisted);
		const plan = restoreResumePlan(
			persisted,
			resumesWrittenConversation ? status : "running",
		);
		const pty = spawnPty(
			resumesWrittenConversation
				? assistResumeArgs(persisted)
				: assistResumeArgs({ assistArgs: persisted.assistArgs }),
			persisted.cwd,
			id,
			resumedRunEnv(persisted.activity?.itemId, plan),
		);
		return plan.idle
			? waitingSession(base, persisted, pty)
			: runningSession(base, persisted, pty);
	}

	return restoreInteractiveSession(id, persisted, base, status);
}
