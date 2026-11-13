import { type SessionClient, sendTo } from "./broadcast";
import { collectHistory } from "./collectHistory";
import { daemonLog } from "./daemonLog";
import { handleFetchSessionTranscript } from "./handleFetchSessionTranscript";
import { handleFetchTranscript } from "./handleFetchTranscript";
import { handleFetchUserMessages } from "./handleFetchUserMessages";
import { routed } from "./routed";
import type { SessionManager } from "./SessionManager";

async function handleHistory(
	client: SessionClient,
	manager: SessionManager,
): Promise<void> {
	const linked = manager.clients.isPeer(client) ? [] : manager.links.history();
	sendTo(client, { type: "history", sessions: await collectHistory(linked) });
}

async function handleShutdown(
	client: SessionClient,
	manager: SessionManager,
): Promise<void> {
	try {
		await manager.flushActiveMs();
		manager.shutdown();
	} catch (error) {
		const reason = error instanceof Error ? error.message : String(error);
		daemonLog(`shutdown teardown failed: ${reason}; exiting anyway`);
	}
	sendTo(client, { type: "shutting-down" });
	setImmediate(() => process.exit(0));
}

export const lifecycleHandlers = {
	history: handleHistory,
	"fetch-transcript": handleFetchTranscript,
	"fetch-user-messages": routed(handleFetchUserMessages),
	"fetch-session-transcript": routed(handleFetchSessionTranscript),
	shutdown: handleShutdown,
};
