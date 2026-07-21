import { assistResumeArgs } from "./assistResumeArgs";
import type { Session } from "./createSession";
import { deriveRestoreStatus } from "./deriveRestoreStatus";
import type { PersistedSession } from "./loadPersistedSessions";
import { restoreBase } from "./restoreBase";
import { restoreInteractiveSession } from "./restoreInteractiveSession";
import { runningSession, waitingSession } from "./runningSession";
import { spawnPty } from "./spawnPty";
import { isUpdate, updatedSession } from "./updatedSession";

export function restoreSession(
	id: string,
	persisted: PersistedSession,
): Session {
	const base = restoreBase(id, persisted);

	if (isUpdate(persisted)) return updatedSession(id, persisted);

	const idle = deriveRestoreStatus(persisted) !== "running";

	/* why: `assist backlog run` is a phase-orchestrating wrapper; a bare
	 * `claude --resume` pty never exits on completion, so re-launch the wrapper
	 * so the card reaches "done" and the phase chain continues (#304). Pass the
	 * latest discovered sessionId so the wrapper resumes the interrupted phase's
	 * conversation instead of restarting it from scratch (#300). */
	if (needsWrapperRelaunch(persisted)) {
		const pty = spawnPty(
			assistResumeArgs(persisted),
			persisted.cwd,
			id,
			idle ? { ASSIST_RESUME_IDLE: "1" } : undefined,
		);
		return idle
			? waitingSession(base, persisted, pty)
			: runningSession(base, persisted, pty);
	}

	return restoreInteractiveSession(id, persisted, base, idle);
}

function needsWrapperRelaunch(
	persisted: PersistedSession,
): persisted is PersistedSession & { assistArgs: string[] } {
	return (
		isBacklogRun(persisted) ||
		(isOnceLaunch(persisted) && !!persisted.claudeSessionId)
	);
}

function isBacklogRun(
	persisted: PersistedSession,
): persisted is PersistedSession & { assistArgs: string[] } {
	return (
		persisted.commandType === "assist" &&
		persisted.assistArgs?.[0] === "backlog" &&
		persisted.assistArgs?.[1] === "run"
	);
}

const LAUNCH_COMMANDS = ["draft", "feat", "bug", "refine"];

function isOnceLaunch(
	persisted: PersistedSession,
): persisted is PersistedSession & { assistArgs: string[] } {
	return (
		persisted.commandType === "assist" &&
		!!persisted.assistArgs &&
		LAUNCH_COMMANDS.includes(persisted.assistArgs[0]) &&
		persisted.assistArgs.includes("--once")
	);
}
