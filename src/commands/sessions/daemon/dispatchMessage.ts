import { type SessionClient, sendTo } from "./broadcast";
import type { SessionManager } from "./SessionManager";

type Msg = Record<string, unknown>;
type Handler = (
	client: SessionClient,
	manager: SessionManager,
	data: Msg,
) => void;

function sendCreated(client: SessionClient, id: string): void {
	sendTo(client, { type: "created", sessionId: id });
}

function handleCreate(
	client: SessionClient,
	manager: SessionManager,
	data: Msg,
): void {
	sendCreated(
		client,
		manager.spawn(
			data.prompt as string | undefined,
			data.cwd as string | undefined,
		),
	);
}

function handleCreateRun(
	client: SessionClient,
	manager: SessionManager,
	data: Msg,
): void {
	sendCreated(
		client,
		manager.spawnRun(
			data.runName as string,
			(data.runArgs as string[]) ?? [],
			data.cwd as string | undefined,
		),
	);
}

function handleCreateAssist(
	client: SessionClient,
	manager: SessionManager,
	data: Msg,
): void {
	sendCreated(
		client,
		manager.spawnAssist(
			(data.assistArgs as string[]) ?? [],
			data.cwd as string | undefined,
		),
	);
}

function handleResume(
	client: SessionClient,
	manager: SessionManager,
	data: Msg,
): void {
	sendCreated(
		client,
		manager.resume(
			data.sessionId as string,
			data.cwd as string,
			data.name as string | undefined,
		),
	);
}

function handleHistory(client: SessionClient, manager: SessionManager): void {
	manager.getHistory().then((history) => {
		sendTo(client, { type: "history", sessions: history });
	});
}

function handleShutdown(client: SessionClient, manager: SessionManager): void {
	manager.shutdown();
	sendTo(client, { type: "shutting-down" });
	// Exit on the next tick so the ack is flushed to the socket first
	setImmediate(() => process.exit(0));
}

const handlers: Record<string, Handler> = {
	ping: (client) => sendTo(client, { type: "pong", pid: process.pid }),
	create: handleCreate,
	"create-run": handleCreateRun,
	"create-assist": handleCreateAssist,
	resume: handleResume,
	history: handleHistory,
	shutdown: handleShutdown,
	input: (_client, m, d) =>
		m.writeToSession(d.sessionId as string, d.data as string),
	resize: (_client, m, d) =>
		m.resizeSession(d.sessionId as string, d.cols as number, d.rows as number),
	retry: (_client, m, d) => m.retrySession(d.sessionId as string),
	dismiss: (_client, m, d) => m.dismissSession(d.sessionId as string),
	"set-autorun": (_client, m, d) =>
		m.setAutoRun(d.sessionId as string, d.enabled as boolean),
	"set-autoadvance": (_client, m, d) =>
		m.setAutoAdvance(d.sessionId as string, d.enabled as boolean),
};

export function dispatchMessage(
	client: SessionClient,
	manager: SessionManager,
	data: Msg,
): void {
	handlers[data.type as string]?.(client, manager, data);
}
