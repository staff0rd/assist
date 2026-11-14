import type { TimedSample } from "./toSdkProcessInfo";

function isFlat(next: TimedSample, previous: TimedSample): boolean {
	const a = next.sample;
	const b = previous.sample;
	return (
		a.pid === b.pid &&
		a.cpuTicks === b.cpuTicks &&
		a.readBytes === b.readBytes &&
		a.writeBytes === b.writeBytes
	);
}

export function nextFlatSince(
	next: TimedSample,
	previous: TimedSample | undefined,
	flatSince: number | undefined,
): number {
	if (!previous || flatSince === undefined || !isFlat(next, previous))
		return next.at;
	return flatSince;
}
