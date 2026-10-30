import type { Session } from "./createSession";
import type { PersistedSession } from "./loadPersistedSessions";
import { restoreBase } from "./restoreBase";

export function deferredSession(
	id: string,
	persisted: PersistedSession,
	cap: number,
): Session {
	return {
		...restoreBase(id, persisted),
		status: "stopped",
		startedAt: persisted.startedAt,
		runningMs: persisted.runningMs ?? 0,
		runningSince: null,
		waitingSince: null,
		pty: null,
		claudeSessionId: persisted.claudeSessionId,
		runName: persisted.runName,
		runArgs: persisted.runArgs,
		activity: persisted.activity,
		restored: false,
		scrollback: deferralNotice(persisted, cap),
	};
}

function deferralNotice(persisted: PersistedSession, cap: number): string {
	return [
		`\r\n\x1b[33mNot resumed: restore was already at its cap of ${cap} session(s) (raise it with: assist config set sessions.maxLive <n> --node)\x1b[0m\r\n`,
		`This card is the handle for it. Its command, working directory (${persisted.cwd})\r\n`,
		"and transcript are intact — restart to put an agent back in it, or dismiss it.\r\n",
	].join("");
}
