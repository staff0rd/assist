import type { NodeHealth, ProbeResult } from "./probeHealth";

export type Connection =
	| { kind: "probing" }
	| { kind: "connected"; health: NodeHealth }
	| { kind: "unreachable"; error: string; attempt: number; retryAt: number };

export function retryDelayMs(attempt: number): number {
	return Math.min(2000 * 2 ** attempt, 30_000);
}

export function toConnection(result: ProbeResult, attempt: number): Connection {
	if (result.ok) return { kind: "connected", health: result.health };
	return {
		kind: "unreachable",
		error: result.error,
		attempt,
		retryAt: Date.now() + retryDelayMs(attempt),
	};
}
