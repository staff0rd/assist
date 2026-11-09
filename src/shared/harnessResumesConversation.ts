import type { HarnessKind } from "./harnesses";
import { harnessCapability } from "./harnessAdapters/harnessCapability";

export function harnessResumesConversation(
	harness: HarnessKind | undefined,
): boolean {
	return harnessCapability(harness, "conversation.resume").supported;
}
