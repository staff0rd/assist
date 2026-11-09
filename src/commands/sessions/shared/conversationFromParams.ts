import { harnessKinds } from "../../../shared/harnessKinds";
import type { HarnessKind } from "../../../shared/harnesses";
import type { ConversationTarget } from "./sessionConversationTarget";

function isHarnessKind(value: string | null): value is HarnessKind {
	return (harnessKinds as readonly (string | null)[]).includes(value);
}

export function conversationFromParams(
	params: URLSearchParams,
): ConversationTarget | undefined {
	const conversationId = params.get("session");
	if (!conversationId) return undefined;
	const harness = params.get("harness");
	return isHarnessKind(harness)
		? { conversationId, harness }
		: { conversationId };
}
