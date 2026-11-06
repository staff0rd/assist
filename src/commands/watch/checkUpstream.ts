import { consumeSimulatedDivergence } from "./consumeSimulatedDivergence";
import { fetchQuietly } from "./fetchQuietly";
import { readMovement } from "./readMovement";
import type { WatchOutcome } from "./WatchOutcome";

export function checkUpstream(
	upstream: string,
	intervalMs: number,
	cwd?: string,
): WatchOutcome | undefined {
	if (consumeSimulatedDivergence(cwd))
		return { kind: "simulated-divergence", upstream };
	const fetchError = fetchQuietly(cwd, intervalMs);
	if (fetchError) return { kind: "fetch-failed", upstream, reason: fetchError };
	const found = readMovement(cwd);
	return found && { kind: "moved", upstream, ...found };
}
