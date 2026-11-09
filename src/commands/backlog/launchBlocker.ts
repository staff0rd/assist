import { formatUnavailable } from "../../shared/harnessAdapters/formatUnavailable";
import { resolveFeature } from "../../shared/harnessAdapters/resolveFeature";
import type {
	HarnessAdapter,
	HarnessFeature,
} from "../../shared/harnessAdapters/types";

const plainLaunch: HarnessFeature = {
	id: "launch",
	label: "This launch",
	requires: [],
};

export function launchBlocker(
	adapter: HarnessAdapter,
	feature: HarnessFeature = plainLaunch,
	resumeSessionId?: string,
): string | undefined {
	const required: HarnessFeature = resumeSessionId
		? {
				...feature,
				requires: [...feature.requires, "conversation.resume"],
			}
		: feature;
	const resolution = resolveFeature(required, adapter);
	if (resolution.available) return undefined;
	const what = resumeSessionId ? `Resuming ${feature.label}` : feature.label;
	return formatUnavailable(what, adapter.label, resolution.reasons);
}
