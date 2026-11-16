import { harnessAdapter } from "../../../shared/harnessAdapters/harnessAdapter";
import { completeBinding } from "./completeBinding";
import type { Session } from "./createSession";
import type { OnStatusChange } from "./types";
import { watchTranscript } from "./watchTranscript";

export function bindDrivenConversation(
	session: Session,
	conversationId: string,
	notify: (() => void) | undefined,
	onStatusChange: OnStatusChange,
): void {
	const adapter = harnessAdapter(session.harness);
	if (adapter.conversation.boundId(session) === conversationId) return;
	const refresh = notify ?? (() => {});
	completeBinding(
		session,
		{ conversationId, harnessLabel: adapter.label },
		refresh,
		(s) => watchTranscript(s, refresh, onStatusChange),
	);
}
