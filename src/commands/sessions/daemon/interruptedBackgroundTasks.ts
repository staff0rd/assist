import { harnessAdapter } from "../../../shared/harnessAdapters/harnessAdapter";
import { interruptedTaskRestoreFeature } from "../../../shared/harnessAdapters/transcriptFeatures";
import { resolveCapability } from "../../../shared/harnessAdapters/resolveCapability";
import type { PersistedSession } from "./loadPersistedSessions";

export function interruptedBackgroundTasks(
	persisted: PersistedSession,
): string[] {
	const adapter = harnessAdapter(persisted.harness);
	const restorable = interruptedTaskRestoreFeature.requires.every(
		(capability) =>
			resolveCapability(adapter.capabilities, capability).supported,
	);
	if (!restorable) return [];
	return adapter.conversation.interruptedTasks?.(persisted) ?? [];
}
