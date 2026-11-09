import { daemonLog } from "./daemonLog";

const LOG_AFTER_IDLE_MS = 60_000;

let lastAt: number | undefined;

export const userActivity = {
	get: (): number | undefined => lastAt,
	record: (at = Date.now()): void => {
		if (lastAt === undefined || at - lastAt > LOG_AFTER_IDLE_MS)
			daemonLog(
				`user-activity: web UI in use${lastAt === undefined ? "" : ` after ${Math.round((at - lastAt) / 1000)}s idle`}`,
			);
		lastAt = at;
	},
};
