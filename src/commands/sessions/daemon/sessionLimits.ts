import { daemonLog } from "./daemonLog";

/** Absolute ceiling on concurrent live sessions a single daemon may hold. */
const MAX_LIVE = 12;

/** Most sessions a single restore() batch will respawn; the remainder are
 * skipped and logged so a daemon birth can't resurrect the whole persisted
 * list. Kept below MAX_LIVE to leave headroom for manual spawns. */
const MAX_RESTORE = 10;

export const sessionLimits = {
	maxRestore: MAX_RESTORE,

	/** Allocate the next session id from counter, refusing past the absolute
	 * ceiling regardless of caller (restore, web create, retry) so no trigger
	 * can fan out without bound. The counter advances only when allowed. */
	nextId(liveCount: number, counter: { next: number }): string {
		if (liveCount >= MAX_LIVE) {
			daemonLog(`refusing to spawn: at ceiling of ${MAX_LIVE} live sessions`);
			throw new Error(`session ceiling of ${MAX_LIVE} reached`);
		}
		return String(counter.next++);
	},
};
