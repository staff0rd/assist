import { resolveHarness } from "../../../shared/harnessLabel";
import type { Session } from "./createSession";
import type { RestoreStatus } from "./deriveRestoreStatus";
import { errorSession } from "./errorSession";
import type { PersistedSession } from "./loadPersistedSessions";
import type { restoreBase } from "./restoreBase";
import { restoreCodexSession } from "./restoreCodexSession";
import { unresumableReason } from "./unresumableReason";
import { resumeViaClaude } from "./resumeViaClaude";

type RestoreBase = ReturnType<typeof restoreBase>;

function isCodex(harness: PersistedSession["harness"]): boolean {
	return resolveHarness(harness) === "codex";
}

export function restoreInteractiveSession(
	id: string,
	persisted: PersistedSession,
	base: RestoreBase,
	status: RestoreStatus,
): Session {
	/* why: assist sessions that wrap claude (e.g. `assist draft`) and plain claude
	 * sessions resume via their discovered sessionId. Pass the same restart nudge
	 * backlog runs use so the reattached conversation continues the interrupted
	 * work instead of sitting idle waiting for input (#404). */
	if (
		persisted.commandType !== "run" &&
		persisted.claudeSessionId &&
		resolveHarness(persisted.harness) === "claude"
	) {
		return resumeViaClaude(id, persisted, base, status);
	}

	if (persisted.commandType !== "run" && isCodex(persisted.harness)) {
		const resumed = restoreCodexSession(id, persisted, base, status);
		if (resumed) return resumed;
	}

	/* why: a plain claude session that reaches here has no claudeSessionId to
	 * `--resume` and no run/assist args to retry, so the conversation is
	 * unrecoverable. Surface an error (logged by SessionManager.restore) instead
	 * of a silent "done" stub the client renders as "Starting…" forever (#396). */
	if (persisted.commandType === "claude") {
		return unrecoverableClaude(id, persisted);
	}

	/* why: run/assist sessions can be re-launched from their stored args, so a
	 * retryable "done" card is recoverable — only the unrecoverable claude case
	 * above is an error. */
	return notRestoredStub(base, persisted);
}

function unrecoverableClaude(id: string, persisted: PersistedSession): Session {
	return errorSession(id, persisted, unresumableReason(persisted.harness));
}

function notRestoredStub(
	base: RestoreBase,
	persisted: PersistedSession,
): Session {
	return {
		...base,
		status: "done",
		startedAt: persisted.startedAt,
		runningMs: persisted.runningMs ?? 0,
		runningSince: null,
		waitingSince: null,
		pty: null,
		runName: persisted.runName,
		runArgs: persisted.runArgs,
		restored: false,
	};
}
