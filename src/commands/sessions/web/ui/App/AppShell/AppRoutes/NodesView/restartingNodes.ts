export const RESTART_GRACE_MS = 30_000;

/** Nodes this tab started restarting within the grace period. */
export function restartingNodes(
	busy: Readonly<Record<string, string>>,
	busySince: Readonly<Record<string, number>>,
	now: number,
): Set<string> {
	return new Set(
		Object.keys(busy).filter(
			(name) =>
				busy[name] === "Restarting" &&
				now - (busySince[name] ?? 0) < RESTART_GRACE_MS,
		),
	);
}
