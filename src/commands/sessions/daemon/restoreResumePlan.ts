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
	if (!killedByDaemonRestart(persisted.interrupted)) return { idle };

	const tasks = interruptedBackgroundTasks(persisted);
	if (idle && tasks.length === 0) return { idle: true };
	return { prompt: daemonRestartPrompt(tasks), idle: false };
}

export function resumePrompt(plan: ResumePlan): string | undefined {
	if (plan.idle) return undefined;
	return plan.prompt ?? buildResumePrompt();
}
