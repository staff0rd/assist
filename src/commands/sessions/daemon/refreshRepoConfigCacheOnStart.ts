import { refreshRepoConfigCache } from "../../../shared/refreshRepoConfigCache";
import { daemonLog } from "./daemonLog";

export async function refreshRepoConfigCacheOnStart(): Promise<void> {
	try {
		const count = await refreshRepoConfigCache();
		daemonLog(`repo config cache refreshed (${count} repos)`);
	} catch (error) {
		daemonLog(
			`repo config cache refresh failed; keeping the last snapshot: ${String(error)}`,
		);
	}
}
