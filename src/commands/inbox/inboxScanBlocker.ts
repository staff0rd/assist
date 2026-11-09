import { harnessAdapter } from "../../shared/harnessAdapters/harnessAdapter";
import { inboxFeature } from "../../shared/harnessAdapters/harnessFeatures";
import { launchBlocker } from "../../shared/harnessAdapters/launchBlocker";
import type { HarnessKind } from "../../shared/harnesses";

export function inboxScanBlocker(
	harness: HarnessKind | undefined,
): string | undefined {
	return launchBlocker(harnessAdapter(harness), inboxFeature);
}
