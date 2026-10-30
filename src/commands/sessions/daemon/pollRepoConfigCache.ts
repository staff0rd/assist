import { readRepoConfigCache } from "../../../shared/readRepoConfigCache";
import { readUserConfigCache } from "../../../shared/readUserConfigCache";
import { refreshRepoConfigCache } from "../../../shared/refreshRepoConfigCache";
import { daemonLog } from "./daemonLog";

const POLL_MS = 60_000;

function cacheSnapshot(): string {
	return JSON.stringify([readRepoConfigCache(), readUserConfigCache()]);
}

export function pollRepoConfigCache(intervalMs: number = POLL_MS): () => void {
	let inFlight = false;
	let failing = false;
	const tick = async () => {
		if (inFlight) return;
		inFlight = true;
		try {
			const before = cacheSnapshot();
			const count = await refreshRepoConfigCache();
			if (failing) daemonLog("repo config cache poll recovered");
			failing = false;
			if (cacheSnapshot() !== before)
				daemonLog(`repo config cache updated (${count} repos)`);
		} catch (error) {
			if (!failing)
				daemonLog(
					`repo config cache poll failed; keeping the last snapshot: ${String(error)}`,
				);
			failing = true;
		} finally {
			inFlight = false;
		}
	};
	const timer = setInterval(() => void tick(), intervalMs);
	timer.unref();
	return () => clearInterval(timer);
}
