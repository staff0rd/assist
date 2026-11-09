import type {
	ConnectorRun,
	HarnessAdapter,
	StructuredRun,
} from "../../shared/harnessAdapters/types";

export type FakeHarnessCalls = {
	interactive: Parameters<HarnessAdapter["interactive"]>[0][];
	oneShot: string[];
	structured: StructuredRun[];
	connector: ConnectorRun[];
	relocate: [conversationId: string, fromCwd: string, toCwd: string][];
};

export function fakeHarnessCalls(): FakeHarnessCalls {
	return {
		interactive: [],
		oneShot: [],
		structured: [],
		connector: [],
		relocate: [],
	};
}
