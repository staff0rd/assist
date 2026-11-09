import { harnessAdapter } from "../../../shared/harnessAdapters/harnessAdapter";
import { resolveCapability } from "../../../shared/harnessAdapters/resolveCapability";
import type { ConversationRef } from "../../../shared/harnessAdapters/types";
import type { HarnessKind } from "../../../shared/harnesses";

type ResumeOutcome =
	| { id: string; reason?: undefined }
	| { id?: undefined; reason: string };

export function conversationResumeOutcome(
	session: ConversationRef & { harness?: HarnessKind },
): ResumeOutcome {
	const adapter = harnessAdapter(session.harness);
	const resume = resolveCapability(adapter.capabilities, "conversation.resume");
	if (!resume.supported) return { reason: resume.reason };
	const id = adapter.conversation.findResumable(session);
	if (id) return { id };
	return {
		reason: `no ${adapter.conversation.idName} was recorded before the daemon stopped, or its conversation is no longer on disk`,
	};
}
