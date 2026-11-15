import type { HarnessCliProbe } from "./probeHarnessCli";

export type NodeRuntimeReport = {
	node: { version: string; path: string };
	declared?: { spec: string; version?: string; path?: string; error?: string };
	mismatch?: string;
	harnesses: HarnessCliProbe[];
};
