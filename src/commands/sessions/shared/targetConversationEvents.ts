import { harnessAdapter } from "../../../shared/harnessAdapters/harnessAdapter";
import type { ConversationEvent } from "../../../shared/harnessAdapters/types";
import { lookupConversation } from "./conversationOf";
import { readTranscriptTail } from "./readTranscriptTail";
import type { ConversationTarget } from "./sessionConversationTarget";

export async function targetConversationEvents(
	cwd: string,
	target: ConversationTarget,
): Promise<ConversationEvent[]> {
	const adapter = harnessAdapter(target.harness);
	const ref = adapter.conversation.toRef(target.conversationId, cwd);
	const lookup = lookupConversation({ ...ref, harness: target.harness });
	if (!lookup.readable || !lookup.conversation) return [];
	const filePath =
		lookup.reader.locate(ref) ??
		(await adapter.conversation.locate(target.conversationId));
	if (!filePath) return [];
	const entries = await readTranscriptTail(filePath, Number.POSITIVE_INFINITY);
	return lookup.reader.events(entries);
}
