import { logRenderedStatus } from "./logRenderedStatus";
import { resolveActiveId } from "./resolveActiveId";
import type { SessionInfo } from "./types";
import type { WsDispatch } from "./WsDispatch";

export function handleSessions(
	msg: Record<string, unknown>,
	d: WsDispatch,
): void {
	const sessions = msg.sessions as SessionInfo[];
	logRenderedStatus(sessions);
	d.setSessions(sessions);
	if (msg.cwd) d.setCurrentCwd(msg.cwd as string);
	const active = (msg.active ?? {}) as Record<string, string>;
	d.setDaemonActiveId(resolveActiveId(active, sessions));
}
