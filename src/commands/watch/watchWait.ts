import { describeOutcome } from "./describeOutcome";
import { emitWatchState } from "./emitWatchState";
import { parseWatchDurations } from "./parseWatchDurations";
import { pullAndBuild } from "./pullAndBuild";
import { reportOutcome } from "./reportOutcome";
import { waitForUpstream } from "./waitForUpstream";

type WatchWaitOptions = {
	interval: string;
	timeout: string;
	pull?: boolean;
	build?: boolean | string;
};

export async function watchWait(options: WatchWaitOptions): Promise<void> {
	const { intervalMs, timeoutMs } = parseWatchDurations(
		options.interval,
		options.timeout,
	);

	const outcome = await waitForUpstream({
		intervalMs,
		timeoutMs,
		timeout: options.timeout,
		onStart: (upstream) => {
			emitWatchState("waiting");
			console.log(`waiting on ${upstream} …`);
		},
	});

	const waitReport = describeOutcome(outcome);
	reportOutcome(waitReport);

	if (outcome.kind !== "moved" || !options.pull)
		return process.exit(waitReport.exitCode);

	await pullAndBuild(outcome.from, options.build);
}
