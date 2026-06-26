import type { SessionInfo } from "./createSession";
import { toWindowsSessionId } from "./toWindowsSessionId";
import type { WindowsProxyState } from "./WindowsProxyState";

type Msg = Record<string, unknown>;

export function handleSessions(state: WindowsProxyState, msg: Msg): void {
	state.windowsSessions = (msg.sessions as SessionInfo[]).map((s) => ({
		...s,
		id: toWindowsSessionId(s.id),
	}));
	const live = new Set(state.windowsSessions.map((s) => s.id));
	for (const id of state.scrollback.keys())
		if (!live.has(id)) state.scrollback.delete(id);
	state.onSessionsChanged();
}
