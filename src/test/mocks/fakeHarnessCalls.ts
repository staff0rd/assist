import type {
	HarnessAdapter,
	StructuredRun,
} from "../../shared/harnessAdapters/types";

export type FakeHarnessCalls = {
	interactive: Parameters<HarnessAdapter["interactive"]>[0][];
	oneShot: string[];
	structured: StructuredRun[];
};

export function fakeHarnessCalls(): FakeHarnessCalls {
	return { interactive: [], oneShot: [], structured: [] };
}
