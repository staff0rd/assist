import { harnessAdapter } from "../../../shared/harnessAdapters/harnessAdapter";
import { resolveCapability } from "../../../shared/harnessAdapters/resolveCapability";
import type { PersistedSession } from "./loadPersistedSessions";

export function unresumableReason(
	harness: PersistedSession["harness"],
): string {
	const adapter = harnessAdapter(harness);
	const resume = resolveCapability(adapter.capabilities, "conversation.resume");
	return resume.supported
		? `no ${adapter.conversation.idName} was recorded before the daemon stopped, so the conversation cannot be resumed`
		: `${resume.reason}, so the conversation cannot be restored`;
}
