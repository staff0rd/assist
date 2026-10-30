import { runInboxScan } from "../../inbox/runInboxScan";
import { getDb } from "../../../shared/db/getDb";
import { loadConfig } from "../../../shared/loadConfig";
import { daemonLog } from "./daemonLog";
import { firstDelayMs } from "./inbox/firstDelayMs";
import { intervalMinutes } from "./inbox/intervalMinutes";

function errorText(error: unknown): string {
	return error instanceof Error ? error.message : String(error);
}

export function startInboxScans(onAdded: () => void): () => void {
	const minutes = intervalMinutes();
	if (!minutes) {
		daemonLog("inbox: scheduled scans off (inbox.intervalMinutes unset)");
		return () => {};
	}
	if (!process.env.ASSIST_DATABASE_URL && !loadConfig().database.url) {
		daemonLog("inbox: scheduled scans off (no database configured)");
		return () => {};
	}
	const intervalMs = minutes * 60_000;
	let timer: NodeJS.Timeout | undefined;
	let stopped = false;
	const schedule = (delayMs: number) => {
		if (stopped) return;
		timer = setTimeout(() => void tick(), delayMs);
		timer.unref();
	};
	const tick = async () => {
		daemonLog("inbox: scan started");
		try {
			const { flagged, added } = await runInboxScan(await getDb());
			daemonLog(`inbox: scan flagged ${flagged} message(s), ${added} new`);
			if (added > 0) onAdded();
		} catch (error) {
			daemonLog(`inbox: scan failed: ${errorText(error)}`);
		}
		schedule(intervalMs);
	};
	daemonLog(`inbox: scanning every ${minutes} minute(s)`);
	void firstDelayMs(intervalMs).then(schedule);
	return () => {
		stopped = true;
		clearTimeout(timer);
	};
}
