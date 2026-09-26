import { discoverSessions } from "../shared/discoverSessions";
import { parseTranscript } from "../shared/parseTranscript";
import { type SessionClient, sendTo } from "./broadcast";
import { daemonLog } from "./daemonLog";
import { handleFetchUserMessages } from "./handleFetchUserMessages";
import { routed } from "./routed";
import type { SessionManager } from "./SessionManager";
import { withRepoGroups } from "./withRepoGroups";

type Msg = Record<string, unknown>;

async function handleHistory(
	client: SessionClient,
	manager: SessionManager,
): Promise<void> {
	const linked = manager.clients.isPeer(client) ? [] : manager.links.history();
	const [local, remote] = await Promise.all([discoverSessions(), linked]);
	sendTo(client, {
		type: "history",
		sessions: withRepoGroups(local).concat(remote),
	});
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
	shutdown: handleShutdown,
};
