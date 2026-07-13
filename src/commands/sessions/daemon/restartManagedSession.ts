import type { SessionClient } from "./broadcast";
import type { Session } from "./createSession";
import { daemonLog } from "./daemonLog";
import { restartSession } from "./restartSession";
import type { OnStatusChange } from "./types";

export type RestartResult = { ok: boolean; reason?: string };

export function restartManagedSession(
	sessions: Map<string, Session>,
	id: string,
	clients: Set<SessionClient>,
	onStatusChange: OnStatusChange,
): RestartResult {
	const s = sessions.get(id);
	if (!s) {
		daemonLog(
			`restart requested for unknown session id=${id} (no live session; ignoring)`,
		);
		return {
			ok: false,
			reason: `Session ${id} is no longer tracked and can't be restarted.`,
		};
	}
	daemonLog(`restart requested: id=${id} status=${s.status} (${s.name})`);
	if (!restartSession(s, clients, onStatusChange)) {
		daemonLog(`restart for session ${id} did nothing: no respawn plan`);
		return {
			ok: false,
			reason: `Session ${s.name} can't be restarted (no resumable command).`,
		};
	}
	return { ok: true };
}
