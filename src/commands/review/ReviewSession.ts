import type {
	HarnessAdapter,
	HarnessFeature,
} from "../../shared/harnessAdapters/types";
import type { SpawnResult } from "../../shared/spawnInherit";

export type ReviewSession = {
	feature: HarnessFeature;
	launch: (adapter: HarnessAdapter, synthesisPath: string) => SpawnResult;
};
