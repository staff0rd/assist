import { activeHarness } from "../lib/activeHarness";
import { harnessAdapter } from "./harnessAdapters/harnessAdapter";
import type { ExecutionIdentity } from "./harnessAdapters/types";
import { resolveSessionItemId } from "./resolveSessionItemId";

export function currentExecutionIdentity(
	conversationId?: string,
): ExecutionIdentity | undefined {
	const harness = activeHarness();
	if (!harness) return undefined;
	return {
		harness,
		conversationId:
			conversationId || harnessAdapter(harness).conversation.current(),
		itemId: resolveSessionItemId(),
	};
}
