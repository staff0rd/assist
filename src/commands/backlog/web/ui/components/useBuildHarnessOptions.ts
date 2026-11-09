import { buildFeature } from "../../../../../shared/harnessAdapters/harnessFeatures";
import { useApiNode } from "../../../../sessions/web/ui/useApiNode";
import { useHarnessCapabilities } from "../../../../sessions/web/ui/useHarnessCapabilities";
import { featureHarnessOptions } from "./featureHarnessOptions";

export function useBuildHarnessOptions() {
	return featureHarnessOptions(
		useHarnessCapabilities(useApiNode()),
		buildFeature.id,
	);
}
