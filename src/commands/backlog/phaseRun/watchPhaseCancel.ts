import { mkdirSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";
import { appendDaemonLog } from "../../sessions/daemon/appendDaemonLog";
import { getReady } from "../shared";
import { getSignalPath } from "../writeSignal";
import { loadPhaseRunRows } from "./loadPhaseProgress";
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

export async function ownsPhase(
	itemId: number,
	idx: number,
	token: string,
): Promise<boolean> {
	const { orm } = await getReady();
	const row = (await loadPhaseRunRows(orm, itemId)).find((r) => r.idx === idx);
	return row?.runState === "running" && row.runToken === token;
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
 * exit outright if nothing is left to notice the signal.
 */
export function watchPhaseCancel(
	itemId: number,
	idx: number,
	token: string,
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
				setTimeout(() => process.exit(0), EXIT_GRACE_MS).unref();
			},
			() => {},
		);
	}, POLL_MS);
	timer.unref();
	return { cancelled: () => cancelled, stop: () => clearInterval(timer) };
}
