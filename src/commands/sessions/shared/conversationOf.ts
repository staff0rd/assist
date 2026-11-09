import { harnessAdapter } from "../../../shared/harnessAdapters/harnessAdapter";
import { resolveCapability } from "../../../shared/harnessAdapters/resolveCapability";
import type {
	CapabilityStatus,
	ConversationReader,
	ConversationRef,
} from "../../../shared/harnessAdapters/types";
import type { HarnessKind } from "../../../shared/harnesses";

type SessionRef = ConversationRef & { harness?: HarnessKind };

export type SessionConversation = {
	reader: ConversationReader;
	ref: ConversationRef;
	id: string;
	key: string;
};

type ConversationLookup =
	| {
			readable: true;
			reader: ConversationReader;
			conversation?: SessionConversation;
	  }
	| { readable: false; reason: string };

export function lookupConversation(session: SessionRef): ConversationLookup {
	const adapter = harnessAdapter(session.harness);
	const status: CapabilityStatus = resolveCapability(
		adapter.capabilities,
		"transcript.read",
	);
	const reader = adapter.conversation.reader;
	if (!status.supported) return { readable: false, reason: status.reason };
	if (!reader)
		return { readable: false, reason: `${adapter.label} has no reader` };
	const ref: ConversationRef = {
		cwd: session.cwd,
		claudeSessionId: session.claudeSessionId,
		harnessSessionId: session.harnessSessionId,
	};
	const id = adapter.conversation.boundId(ref);
	if (!id) return { readable: true, reader };
	return {
		readable: true,
		reader,
		conversation: { reader, ref, id, key: `${adapter.kind}:${id}` },
	};
}

export function conversationOf(
	session: SessionRef,
): SessionConversation | undefined {
	const lookup = lookupConversation(session);
	return lookup.readable ? lookup.conversation : undefined;
}
