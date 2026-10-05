import { consumeMarker } from "./consumeMarker";
import { consumeSimulatedDivergence } from "./consumeSimulatedDivergence";
import { fetchQuietly } from "./fetchQuietly";
import { readMovement } from "./readMovement";
import type { WatchControlPaths } from "./watchControlPaths";
import type { WatchOutcome } from "./WatchOutcome";

const CONTROL_POLL_MS = 1000;

type PollOptions = {
	upstream: string;
	intervalMs: number;
	timeoutMs: number | undefined;
	timeout: string;
	cwd?: string;
	control?: WatchControlPaths;
};

export function pollForMovement(options: PollOptions): Promise<WatchOutcome> {
	const { upstream, intervalMs, timeoutMs, timeout, cwd, control } = options;

	return new Promise<WatchOutcome>((resolve) => {
		let settled = false;

		const finish = (outcome: WatchOutcome): void => {
			if (settled) return;
			settled = true;
			clearInterval(ticker);
			clearInterval(controller);
			clearTimeout(deadline);
			process.off("SIGINT", onInterrupt);
			resolve(outcome);
		};

		const onInterrupt = (): void => finish({ kind: "interrupted" });

		const check = (): void => {
			if (consumeSimulatedDivergence(cwd))
				return finish({ kind: "simulated-divergence", upstream });
			fetchQuietly(cwd, intervalMs);
			const found = readMovement(cwd);
			if (found) finish({ kind: "moved", upstream, ...found });
		};

		const ticker = setInterval(check, intervalMs);

		const controller =
			control &&
			setInterval(() => {
				if (consumeMarker(control.stop)) return finish({ kind: "interrupted" });
				if (consumeMarker(control.check)) check();
			}, CONTROL_POLL_MS);

		const deadline =
			timeoutMs === undefined
				? undefined
				: setTimeout(
						() => finish({ kind: "timeout", upstream, timeout }),
						timeoutMs,
					);

		process.on("SIGINT", onInterrupt);
	});
}
