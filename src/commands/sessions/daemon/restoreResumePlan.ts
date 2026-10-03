import { buildResumePrompt } from "../../backlog/buildResumePrompt";
import { daemonRestartPrompt } from "./daemonRestartPrompt";
import type { RestoreStatus } from "./deriveRestoreStatus";
import { interruptedBackgroundTasks } from "./interruptedBackgroundTasks";
import type { PersistedSession } from "./loadPersistedSessions";
import { killedByDaemonRestart } from "./SessionInterruption";
import { pendingQuestionPrompt } from "./pendingQuestionPrompt";

export type ResumePlan = { prompt?: string; idle: boolean };

export function restoreResumePlan(
	persisted: PersistedSession,
	status: RestoreStatus,
): ResumePlan {
	const tasks = interruptedBackgroundTasks(persisted);
	if (tasks.length > 0)
		return { prompt: daemonRestartPrompt(tasks), idle: false };
	if (status === "asking")
		return { prompt: pendingQuestionPrompt(), idle: false };
	const idle = status === "waiting";
	if (!killedByDaemonRestart(persisted.interrupted) || idle) return { idle };
	return { prompt: daemonRestartPrompt(tasks), idle: false };
}

export function resumePrompt(plan: ResumePlan): string | undefined {
	if (plan.idle) return undefined;
	return plan.prompt ?? buildResumePrompt();
}
