import type { SdkProcessInfo } from "../../../../../shared/harnessAdapters/types";
import { createLeafProcessTracker } from "./createLeafProcessTracker";
import { dedupeProcessEmit } from "./dedupeProcessEmit";
import { CLOCK_TICKS_PER_SECOND, readUptimeTicks } from "./readUptimeTicks";
import { sampleLeafProcess } from "./sampleLeafProcess";
import { startSerialInterval } from "./startSerialInterval";

const SAMPLE_INTERVAL_MS = 2000;
// why: the tool's shell can start just before its tool_use message reaches the daemon
const START_GRACE_TICKS = 2 * CLOCK_TICKS_PER_SECOND;

type WatchOptions = {
	procRoot?: string;
	platform?: NodeJS.Platform;
	now?: () => number;
};

export function createSdkProcessWatch(
	getPid: () => number,
	emit: (process: SdkProcessInfo | null) => void,
	{
		procRoot = "/proc",
		platform = process.platform,
		now = Date.now,
	}: WatchOptions = {},
) {
	let generation = 0;
	let stopTimer: (() => void) | undefined;
	const tracker = createLeafProcessTracker(now);
	const publish = dedupeProcessEmit(emit);

	const tick = async (run: number, pid: number, since: number) => {
		const sample = await sampleLeafProcess(procRoot, pid, since);
		if (run !== generation) return;
		publish(tracker.next(sample));
	};

	const stop = () => {
		generation++;
		stopTimer?.();
		stopTimer = undefined;
		tracker.reset();
		publish(null);
	};

	const start = async () => {
		stop();
		const pid = getPid();
		if (platform !== "linux" || !pid) return;
		const run = generation;
		const uptime = await readUptimeTicks(procRoot);
		if (run !== generation || uptime === undefined) return;
		const since = uptime - START_GRACE_TICKS;
		stopTimer = startSerialInterval(
			() => tick(run, pid, since),
			SAMPLE_INTERVAL_MS,
		);
	};

	return { start, stop };
}
