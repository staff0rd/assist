import type { WebSocket } from "ws";
import { handleRunConfigs } from "./handleRunConfigs";
import type { SessionManager } from "./SessionManager";

type Msg = Record<string, unknown>;
type Handler = (ws: WebSocket, manager: SessionManager, data: Msg) => void;

function sendCreated(ws: WebSocket, id: string): void {
	ws.send(JSON.stringify({ type: "created", sessionId: id }));
}

function handleCreate(ws: WebSocket, manager: SessionManager, data: Msg): void {
	sendCreated(
		ws,
		manager.spawn(
			data.prompt as string | undefined,
			data.cwd as string | undefined,
		),
	);
}

function handleCreateRun(
	ws: WebSocket,
	manager: SessionManager,
	data: Msg,
): void {
	sendCreated(
		ws,
		manager.spawnRun(
			data.runName as string,
			(data.runArgs as string[]) ?? [],
			data.cwd as string | undefined,
		),
	);
}

function handleResume(ws: WebSocket, manager: SessionManager, data: Msg): void {
	sendCreated(
		ws,
		manager.resume(
			data.sessionId as string,
			data.cwd as string,
			data.name as string | undefined,
		),
	);
}

function runConfigs(ws: WebSocket, _manager: SessionManager, data: Msg): void {
	handleRunConfigs(ws, data.cwd as string);
}

function handleHistory(ws: WebSocket, manager: SessionManager): void {
	manager.getHistory().then((history) => {
		ws.send(JSON.stringify({ type: "history", sessions: history }));
	});
}

const handlers: Record<string, Handler> = {
	create: handleCreate,
	"create-run": handleCreateRun,
	resume: handleResume,
	"run-configs": runConfigs,
	history: handleHistory,
	input: (_ws, m, d) =>
		m.writeToSession(d.sessionId as string, d.data as string),
	resize: (_ws, m, d) =>
		m.resizeSession(d.sessionId as string, d.cols as number, d.rows as number),
	retry: (_ws, m, d) => m.retrySession(d.sessionId as string),
	dismiss: (_ws, m, d) => m.dismissSession(d.sessionId as string),
};

export function dispatchMessage(
	ws: WebSocket,
	manager: SessionManager,
	data: Msg,
): void {
	handlers[data.type as string]?.(ws, manager, data);
}
