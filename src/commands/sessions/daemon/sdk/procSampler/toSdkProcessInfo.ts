import type { SdkProcessInfo } from "../../../../../shared/harnessAdapters/types";
import { ioBytesPerSecond } from "./ioBytesPerSecond";
import type { LeafProcessSample } from "./sampleLeafProcess";

export type TimedSample = { sample: LeafProcessSample; at: number };

export function toSdkProcessInfo(
	next: TimedSample,
	previous: TimedSample | undefined,
): SdkProcessInfo {
	const ioRate = ioBytesPerSecond(
		next.sample,
		previous?.sample,
		previous ? (next.at - previous.at) / 1000 : 0,
	);
	return {
		command: next.sample.command,
		...(ioRate === undefined ? {} : { ioBytesPerSec: ioRate }),
	};
}
