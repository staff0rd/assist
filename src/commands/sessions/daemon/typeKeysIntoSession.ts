import { daemonLog } from "./daemonLog";
import type { Session } from "./types";
import type { TypePromptReply } from "./typePromptReply";

export function typeKeysIntoSession(
	sessions: Map<string, Session>,
	id: string,
	keys: string,
	write: (id: string, data: string) => void,
): TypePromptReply {
	const session = sessions.get(id);
	if (!session)
		return { ok: false, message: `assist session ${id} was not found` };
	if (session.status === "done" || !session.pty)
		return { ok: false, message: `assist session ${id} has ended` };
	write(id, keys);
	daemonLog(`session ${id} typed keys: ${JSON.stringify(keys)}`);
	return { ok: true, message: `Sent keys to assist session ${id}` };
}
