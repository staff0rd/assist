import { harnessAdapter } from "../../../shared/harnessAdapters/harnessAdapter";
import type { PortWaitDeps } from "./awaitServerPort";
import { START_SLACK_MS } from "./bindConversation";
import { claimedByOthers } from "./claimedByOthers";
import { completeBinding } from "./completeBinding";
import type { Session } from "./createSession";
import { daemonLog } from "./daemonLog";
import { restartSession } from "./restartSession";
import { watchTranscript } from "./watchTranscript";

export function resumeDiscoveredConversations(deps: PortWaitDeps): void {
	for (const session of deps.sessions.values())
		if (session.discoverOnRestore)
			resumeDiscovered(session, deps).catch((error: unknown) =>
				daemonLog(
					`session ${session.id} conversation discovery after daemon restart failed: ${error instanceof Error ? error.message : String(error)}`,
				),
			);
}

async function resumeDiscovered(
	session: Session,
	deps: PortWaitDeps,
): Promise<void> {
	session.discoverOnRestore = undefined;
	const { clients, onStatusChange, notify } = deps;
	const adapter = harnessAdapter(session.harness);
	const conversationId =
		adapter.conversation.boundId(session) ?? (await discover(session));
	if (session.status !== "error" || session.pty) return;
	if (!conversationId) {
		daemonLog(
			`could not resume restored session "${session.name}" (id ${session.id}): ${session.error}`,
		);
		return;
	}
	if (!adapter.conversation.boundId(session))
		completeBinding(
			session,
			{ conversationId, harnessLabel: adapter.label },
			notify,
			(s) => watchTranscript(s, notify, onStatusChange),
		);
	daemonLog(
		`session ${session.id} resuming discovered ${adapter.label} conversation ${conversationId} after daemon restart`,
	);
	if (restartSession(session, clients, onStatusChange, false, notify)) notify();
}

async function discover(session: Session): Promise<string | undefined> {
	const { cwd, startedAt } = session;
	const discoverConversation = harnessAdapter(session.harness).conversation
		.discover;
	if (!discoverConversation || !cwd) return undefined;
	const conversationId = await discoverConversation({
		cwd,
		launchedAt: startedAt,
		sinceMs: startedAt - START_SLACK_MS,
		claimed: claimedByOthers(session),
	});
	return conversationId && !claimedByOthers(session).has(conversationId)
		? conversationId
		: undefined;
}
