export type PathState = "pending" | "running" | "ok" | "failed" | "skipped";

type PendingPathAction =
	| { kind: "skip"; reason: string }
	| { kind: "start" }
	| { kind: "wait" };

export function pendingPathAction(
	enclosing: number[],
	states: PathState[],
	paths: string[],
	stopped: boolean,
): PendingPathAction {
	if (stopped) return { kind: "skip", reason: "install stopped" };
	const failed = enclosing.find(
		(j) => states[j] === "failed" || states[j] === "skipped",
	);
	if (failed !== undefined)
		return { kind: "skip", reason: `${paths[failed]} failed` };
	if (enclosing.every((j) => states[j] === "ok")) return { kind: "start" };
	return { kind: "wait" };
}
