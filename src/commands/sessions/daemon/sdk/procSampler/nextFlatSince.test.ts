import { describe, expect, it } from "vitest";
import { nextFlatSince } from "./nextFlatSince";
import { type TimedSample, toSdkProcessInfo } from "./toSdkProcessInfo";

const at = (
	ms: number,
	{ pid = 200, cpuTicks = 5, readBytes = 10, writeBytes = 20 } = {},
): TimedSample => ({
	sample: { pid, command: "sleep 120", cpuTicks, readBytes, writeBytes },
	at: ms,
});

function idleAfter(samples: TimedSample[]) {
	let previous: TimedSample | undefined;
	let flatSince: number | undefined;
	let info: ReturnType<typeof toSdkProcessInfo> | undefined;
	for (const sample of samples) {
		flatSince = nextFlatSince(sample, previous, flatSince);
		info = toSdkProcessInfo(sample, previous, flatSince);
		previous = sample;
	}
	return info?.idleMinutes;
}

describe("idle detection", () => {
	it("stays quiet until the leaf has been flat for 60s", () => {
		expect(idleAfter([at(0), at(30_000), at(59_999)])).toBeUndefined();
		expect(idleAfter([at(0), at(30_000), at(60_000)])).toBe(1);
		expect(idleAfter([at(0), at(100_000), at(185_000)])).toBe(3);
	});

	it.each([
		["CPU time", { cpuTicks: 6 }],
		["read bytes", { readBytes: 11 }],
		["write bytes", { writeBytes: 21 }],
		["leaf pid", { pid: 201 }],
	])("restarts the idle clock when %s changes", (_, change) => {
		expect(
			idleAfter([at(0), at(50_000, change), at(100_000, change)]),
		).toBeUndefined();
		expect(idleAfter([at(0), at(50_000, change), at(110_000, change)])).toBe(1);
	});
});
