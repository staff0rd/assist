import { mkdirSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";
import { appendDaemonLog } from "../../sessions/daemon/appendDaemonLog";
import { getSignalPath } from "../writeSignal";
import { discardIfCancelled } from "./discardIfCancelled";
import { ownsPhase } from "./ownsPhase";
import { phaseAlreadyDone } from "./phaseAlreadyDone";

const POLL_MS = 5_000;
const EXIT_GRACE_MS = 10_000;

// why: phase-done marks the phase done before its harness exits, which is a finish, not a cancel.
async function stillPhaseWork(
	itemId: number,
	idx: number,
	token: string,
): Promise<boolean> {
	return (
		(await ownsPhase(itemId, idx, token)) ||
		(await phaseAlreadyDone(itemId, idx))
	);
}

function cancelOwnHarness(): void {
	const path = getSignalPath();
	if (!path) return;
	mkdirSync(dirname(path), { recursive: true });
	writeFileSync(path, JSON.stringify({ event: "cancel" }));
}

/**
 * Stop this parallel phase once the run no longer gives it the phase (a rewind
 * reset it, or a newer session took it over): signal the harness to exit, and
 * exit outright, discarding the phase's work, if nothing is left to notice the
 * signal.
 */
export function watchPhaseCancel(
	itemId: number,
	idx: number,
	token: string,
	itemTree: string,
): { cancelled: () => boolean; stop: () => void } {
	let cancelled = false;
	const timer = setInterval(() => {
		void stillPhaseWork(itemId, idx, token).then(
			(keep) => {
				if (keep || cancelled) return;
				cancelled = true;
				appendDaemonLog(
					`backlog run-phase ${itemId} phase ${idx + 1}: cancelled (rewound or superseded)`,
				);
				cancelOwnHarness();
				setTimeout(() => {
					void discardIfCancelled(itemId, idx, token, itemTree).finally(() =>
						process.exit(0),
					);
				}, EXIT_GRACE_MS).unref();
			},
			() => {},
		);
	}, POLL_MS);
	timer.unref();
	return { cancelled: () => cancelled, stop: () => clearInterval(timer) };
}
