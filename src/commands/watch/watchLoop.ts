import { decideLap } from "./decideLap";
import { runWatchLap, WATCH_LAP_ARGS } from "./runWatchLap";

export async function watchLoop(): Promise<void> {
	let interrupted = false;
	const recordInterruptAndLetLapFinish = (): void => {
		interrupted = true;
	};
	process.on("SIGINT", recordInterruptAndLetLapFinish);

	for (let lap = 1; ; lap++) {
		console.log(
			`lap ${lap} at ${new Date().toLocaleTimeString()}: assist ${WATCH_LAP_ARGS.join(" ")}`,
		);
		const end = await runWatchLap();
		const decision = decideLap(end, interrupted);
		const how = end.signal ? `killed by ${end.signal}` : `exited ${end.code}`;
		if (decision.kind === "exit") {
			console.error(`lap ${lap} ${how} — stopping`);
			return process.exit(decision.code);
		}
		console.log(`lap ${lap} ${how} — relaunching`);
	}
}
