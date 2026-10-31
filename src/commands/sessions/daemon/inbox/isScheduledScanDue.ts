import { daemonLog } from "../daemonLog";
import { isInboxScanDue } from "./isInboxScanDue";

export async function isScheduledScanDue(
	intervalMinutes: number,
): Promise<boolean> {
	try {
		return await isInboxScanDue(intervalMinutes);
	} catch (error) {
		daemonLog(`inbox: reading the last scan time failed: ${String(error)}`);
		return false;
	}
}
