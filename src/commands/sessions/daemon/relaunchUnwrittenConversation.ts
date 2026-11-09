import { resolveCapability } from "../../../shared/harnessAdapters/resolveCapability";
import type { HarnessAdapter } from "../../../shared/harnessAdapters/types";
import type { Session } from "./createSession";
import type { PersistedSession } from "./loadPersistedSessions";
import type { restoreBase } from "./restoreBase";
import type { ResumePlan } from "./restoreResumePlan";
import { runningSession, waitingSession } from "./runningSession";

type Restored = {
	id: string;
	persisted: PersistedSession;
	base: ReturnType<typeof restoreBase>;
};

export function relaunchUnwrittenConversation(
	adapter: HarnessAdapter,
	{ id, persisted, base }: Restored,
	plan: ResumePlan,
): Session {
	const conversationId = resolveCapability(
		adapter.capabilities,
		"conversation.preassignId",
	).supported
		? adapter.conversation.boundId(persisted)
		: undefined;
	const pty = adapter.interactive({
		conversationId,
		prompt: persisted.initialPrompt,
		cwd: persisted.cwd,
		sessionId: id,
		design: persisted.design,
		auto: persisted.auto,
	});
	const idle = persisted.initialPrompt ? false : plan.idle;
	return {
		...(idle
			? waitingSession(base, persisted, pty)
			: runningSession(base, persisted, pty)),
		claudeSessionId: undefined,
		harnessSessionId: undefined,
		...adapter.activityIdentity(conversationId),
	};
}
