import type { SdkProcessInfo } from "../../../../../shared/harnessAdapters/types";
import { ioBytesPerSecond } from "./ioBytesPerSecond";
import type { LeafProcessSample } from "./sampleLeafProcess";

export type TimedSample = { sample: LeafProcessSample; at: number };

const IDLE_THRESHOLD_MS = 60_000;

function idleMinutes(next: TimedSample, flatSince: number): number | undefined {
	const flatFor = next.at - flatSince;
	return flatFor < IDLE_THRESHOLD_MS ? undefined : Math.floor(flatFor / 60_000);
}

export function toSdkProcessInfo(
	next: TimedSample,
	previous: TimedSample | undefined,
	flatSince: number = next.at,
): SdkProcessInfo {
	const ioRate = ioBytesPerSecond(
		next.sample,
		previous?.sample,
		previous ? (next.at - previous.at) / 1000 : 0,
	);
	const idle = idleMinutes(next, flatSince);
	return {
		command: next.sample.command,
		...(ioRate === undefined ? {} : { ioBytesPerSec: ioRate }),
		...(idle === undefined ? {} : { idleMinutes: idle }),
	};
}
