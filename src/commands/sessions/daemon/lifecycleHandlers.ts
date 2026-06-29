import { discoverSessions } from "../shared/discoverSessions";
import { parseTranscript } from "../shared/parseTranscript";
import { type SessionClient, sendTo } from "./broadcast";
import type { SessionManager } from "./SessionManager";

type Msg = Record<string, unknown>;

function handleHistory(client: SessionClient): void {
	discoverSessions().then((sessions) =>
		sendTo(client, { type: "history", sessions }),
	);
}

function handleFetchTranscript(
	client: SessionClient,
	_manager: SessionManager,
	data: Msg,
): void {
	const sessionId = data.sessionId as string;
	parseTranscript(sessionId).then((messages) =>
		sendTo(client, { type: "transcript", sessionId, messages }),
	);
}

function handleShutdown(client: SessionClient, manager: SessionManager): void {
	manager.shutdown();
	sendTo(client, { type: "shutting-down" });
	setImmediate(() => process.exit(0));
}

export const lifecycleHandlers = {
	history: handleHistory,
	"fetch-transcript": handleFetchTranscript,
	shutdown: handleShutdown,
};
