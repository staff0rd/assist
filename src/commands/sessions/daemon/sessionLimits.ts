import { daemonLog } from "./daemonLog";
import { maxLiveSessions } from "./maxLiveSessions";

export const sessionLimits = {
	maxRestore(): number {
		return maxLiveSessions();
	},

	/** Allocate the next session id from counter, refusing past the absolute
	 * ceiling regardless of caller (restore, web create, retry) so no trigger
	 * can fan out without bound. The counter advances only when allowed. */
	nextId(liveCount: number, counter: { next: number }): string {
		const ceiling = maxLiveSessions();
		if (liveCount >= ceiling) {
			daemonLog(
				`refusing to spawn: at ceiling of ${ceiling} live sessions (sessions.maxLive)`,
			);
			throw new Error(
				`session ceiling of ${ceiling} reached — raise it with: assist config set sessions.maxLive <n> --node`,
			);
		}
		return String(counter.next++);
	},

	recoveryCardId(counter: { next: number }): string {
		return String(counter.next++);
	},
};
