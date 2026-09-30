import { buildResumePrompt } from "../../backlog/buildResumePrompt";
import { daemonRestartPrompt } from "./daemonRestartPrompt";
import { interruptedBackgroundTasks } from "./interruptedBackgroundTasks";
import type { PersistedSession } from "./loadPersistedSessions";
import { killedByDaemonRestart } from "./SessionInterruption";

export type ResumePlan = { prompt?: string; idle: boolean };

export function restoreResumePlan(
	persisted: PersistedSession,
	idle: boolean,
): ResumePlan {
	const tasks = interruptedBackgroundTasks(persisted);
	if (tasks.length > 0)
		return { prompt: daemonRestartPrompt(tasks), idle: false };
	if (!killedByDaemonRestart(persisted.interrupted) || idle) return { idle };
	return { prompt: daemonRestartPrompt(tasks), idle: false };
}

export function resumePrompt(plan: ResumePlan): string | undefined {
	if (plan.idle) return undefined;
	return plan.prompt ?? buildResumePrompt();
}
