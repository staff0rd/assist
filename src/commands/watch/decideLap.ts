export type LapEnd = { code: number | null; signal: NodeJS.Signals | null };

type LapDecision = { kind: "relaunch" } | { kind: "exit"; code: number };

const RELAUNCH_CODES = new Set([0, 2, 4]);

export function decideLap(end: LapEnd, interrupted: boolean): LapDecision {
	if (interrupted) return { kind: "exit", code: 130 };
	if (end.code === null) return { kind: "relaunch" };
	if (RELAUNCH_CODES.has(end.code)) return { kind: "relaunch" };
	return { kind: "exit", code: end.code };
}
