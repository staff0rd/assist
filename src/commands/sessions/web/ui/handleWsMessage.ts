import type { HistoricalSession, RunConfigInfo, SessionInfo } from "./types";

type OutputHandler = (data: string) => void;

export type WsDispatch = {
	setSessions: (s: SessionInfo[]) => void;
	setHistory: (h: HistoricalSession[]) => void;
	setRunConfigs: (c: RunConfigInfo[]) => void;
	setActiveId: (id: string) => void;
	setCurrentCwd: (cwd: string) => void;
	buffers: React.RefObject<Map<string, string>>;
	handlers: React.RefObject<Map<string, OutputHandler>>;
};

export function handleWsMessage(
	msg: Record<string, unknown>,
	d: WsDispatch,
): void {
	switch (msg.type) {
		case "sessions":
			d.setSessions(msg.sessions as SessionInfo[]);
			if (msg.cwd) d.setCurrentCwd(msg.cwd as string);
			break;
		case "created":
			d.setActiveId(msg.sessionId as string);
			break;
		case "history":
			d.setHistory(msg.sessions as HistoricalSession[]);
			break;
		case "run-configs":
			d.setRunConfigs(msg.configs as RunConfigInfo[]);
			break;
		case "clear": {
			const clearId = msg.sessionId as string;
			d.buffers.current?.delete(clearId);
			d.handlers.current?.get(clearId)?.("\x1bc");
			break;
		}
		case "output": {
			const id = msg.sessionId as string;
			const prev = d.buffers.current?.get(id) ?? "";
			d.buffers.current?.set(id, prev + (msg.data as string));
			d.handlers.current?.get(id)?.(msg.data as string);
			break;
		}
	}
}
