import { consumeSimulatedDivergence } from "./consumeSimulatedDivergence";
import { fetchQuietly } from "./fetchQuietly";
import { pollForMovement } from "./pollForMovement";
import { readMovement } from "./readMovement";
import { resolveUpstream } from "./resolveUpstream";
import type { WatchOutcome } from "./WatchOutcome";

type WaitOptions = {
	intervalMs: number;
	timeoutMs: number | undefined;
	timeout: string;
	cwd?: string;
	onStart?: (upstream: string) => void;
};

export function waitForUpstream(options: WaitOptions): Promise<WatchOutcome> {
	const { intervalMs, timeoutMs, timeout, cwd, onStart } = options;

	let upstream: string;
	try {
		upstream = resolveUpstream(cwd).upstream;
	} catch (error) {
		return Promise.resolve({
			kind: "unavailable",
			reason: error instanceof Error ? error.message : String(error),
		});
	}

	onStart?.(upstream);

	if (consumeSimulatedDivergence(cwd))
		return Promise.resolve({ kind: "simulated-divergence", upstream });

	fetchQuietly(cwd, intervalMs);
	const moved = readMovement(cwd);
	if (moved) return Promise.resolve({ kind: "moved", upstream, ...moved });

	return pollForMovement({ upstream, intervalMs, timeoutMs, timeout, cwd });
}
