import { consumeSimulatedDivergence } from "./consumeSimulatedDivergence";
import { fetchQuietly } from "./fetchQuietly";
import { readMovement } from "./readMovement";
import type { WatchOutcome } from "./WatchOutcome";

type PollOptions = {
	upstream: string;
	intervalMs: number;
	timeoutMs: number | undefined;
	timeout: string;
	cwd?: string;
};

export function pollForMovement(options: PollOptions): Promise<WatchOutcome> {
	const { upstream, intervalMs, timeoutMs, timeout, cwd } = options;

	return new Promise<WatchOutcome>((resolve) => {
		let settled = false;

		const finish = (outcome: WatchOutcome): void => {
			if (settled) return;
			settled = true;
			clearInterval(ticker);
			clearTimeout(deadline);
			process.off("SIGINT", onInterrupt);
			resolve(outcome);
		};

		const onInterrupt = (): void => finish({ kind: "interrupted" });

		const ticker = setInterval(() => {
			if (consumeSimulatedDivergence(cwd))
				return finish({ kind: "simulated-divergence", upstream });
			fetchQuietly(cwd, intervalMs);
			const found = readMovement(cwd);
			if (found) finish({ kind: "moved", upstream, ...found });
		}, intervalMs);

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
