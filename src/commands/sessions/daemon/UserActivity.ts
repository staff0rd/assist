import { daemonLog } from "./daemonLog";

const LOG_AFTER_IDLE_MS = 60_000;

export class UserActivity {
	private lastAt: number | undefined;

	get = (): number | undefined => this.lastAt;

	record(source: string, at = Date.now()): void {
		const last = this.lastAt;
		if (last === undefined || at - last > LOG_AFTER_IDLE_MS)
			daemonLog(
				`user-activity: ${source} in use${last === undefined ? "" : ` after ${Math.round((at - last) / 1000)}s idle`}`,
			);
		this.lastAt = at;
	}
}
