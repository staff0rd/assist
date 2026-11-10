import { harnessAdapter } from "../../../shared/harnessAdapters/harnessAdapter";
import {
	designFeature,
	sessionFeature,
} from "../../../shared/harnessAdapters/harnessFeatures";
import { launchBlocker } from "../../../shared/harnessAdapters/launchBlocker";
import type { HarnessKind } from "../../../shared/harnesses";

export function sessionBlocker(
	harness: HarnessKind | undefined,
	design: boolean,
): string | undefined {
	return launchBlocker(
		harnessAdapter(harness),
		design ? designFeature : sessionFeature,
	);
}
