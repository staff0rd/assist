import { setTimeout as sleep } from "node:timers/promises";
import { consumePause } from "../consumePause";
import { readSignal } from "../readSignal";
import { cleanupSignal } from "../resolvePhaseResult";
import { getReady } from "../shared";
import { loadPhaseProgress } from "./loadPhaseProgress";
import type { PhaseProgress } from "./PhaseProgress";

const POLL_MS = 3_000;

function progressKey(progress: PhaseProgress): string {
	return JSON.stringify(progress);
}

/**
 * Wait while parallel phases run in their own sessions, until one of them
 * finishes or fails, a rewind lands, or the plan changes. A pause request
 * arriving meanwhile is reported through `onPause`.
 */
export async function waitForPhaseProgress(
	itemId: number,
	since: PhaseProgress,
	planLength: () => Promise<number>,
	onPause: () => void,
): Promise<void> {
	const before = progressKey(since);
	const length = await planLength();
	const { orm } = await getReady();
	while (true) {
		await sleep(POLL_MS);
		const signal = readSignal();
		if (signal) {
			cleanupSignal();
			if (signal.event === "rewind") return;
		}
		if (consumePause(itemId)) onPause();
		if (progressKey(await loadPhaseProgress(orm, itemId)) !== before) return;
		if ((await planLength()) !== length) return;
	}
}
