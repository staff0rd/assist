import { getDb } from "../../../../shared/db/getDb";
import { readInboxLastScan } from "../../../../shared/db/readInboxLastScan";
import { daemonLog } from "../daemonLog";

export async function firstDelayMs(intervalMs: number): Promise<number> {
	try {
		const last = await readInboxLastScan(await getDb());
		if (!last) return 0;
		return Math.max(0, last.getTime() + intervalMs - Date.now());
	} catch (error) {
		daemonLog(`inbox: reading the last scan time failed: ${errorText(error)}`);
		return intervalMs;
	}
}

function errorText(error: unknown): string {
	return error instanceof Error ? error.message : String(error);
}
