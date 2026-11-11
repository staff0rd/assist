import { harnessAdapter } from "../../../shared/harnessAdapters/harnessAdapter";
import { resolveCapability } from "../../../shared/harnessAdapters/resolveCapability";
import type { ConversationReader } from "../../../shared/harnessAdapters/types";
import { type HarnessKind, harnesses } from "../../../shared/harnesses";

type LocatedConversation = { reader: ConversationReader; filePath: string };

export async function locateConversation(
	conversationId: string,
): Promise<LocatedConversation | undefined> {
	for (const kind of Object.keys(harnesses) as HarnessKind[]) {
		const adapter = harnessAdapter(kind);
		const reader = adapter.conversation.reader;
		if (!reader) continue;
		if (!resolveCapability(adapter.capabilities, "transcript.read").supported)
			continue;
		const filePath = await adapter.conversation.locate(conversationId);
		if (filePath) return { reader, filePath };
	}
	return undefined;
}
