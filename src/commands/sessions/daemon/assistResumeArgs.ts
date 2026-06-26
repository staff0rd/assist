import type { PersistedSession } from "./loadPersistedSessions";

export function assistResumeArgs(
	persisted: PersistedSession & { assistArgs: string[] },
): string[] {
	const args = ["assist", ...persisted.assistArgs];
	return persisted.claudeSessionId
		? [...args, "--resume-session", persisted.claudeSessionId]
		: args;
}
