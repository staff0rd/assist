import type { SdkProcessInfo } from "../../../../../shared/harnessAdapters/types";
import { nextFlatSince } from "./nextFlatSince";
import type { LeafProcessSample } from "./sampleLeafProcess";
import { type TimedSample, toSdkProcessInfo } from "./toSdkProcessInfo";

export function createLeafProcessTracker(now: () => number) {
	let previous: TimedSample | undefined;
	let flatSince: number | undefined;
	return {
		next(sample: LeafProcessSample | undefined): SdkProcessInfo | null {
			const current = sample ? { sample, at: now() } : undefined;
			flatSince = current
				? nextFlatSince(current, previous, flatSince)
				: undefined;
			const info = current
				? toSdkProcessInfo(current, previous, flatSince)
				: null;
			previous = current;
			return info;
		},
		reset() {
			previous = undefined;
			flatSince = undefined;
		},
	};
}
