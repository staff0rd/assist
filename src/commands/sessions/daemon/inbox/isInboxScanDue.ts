import { getDb } from "../../../../shared/db/getDb";
import { readInboxLastScan } from "../../../../shared/db/readInboxLastScan";

export async function isInboxScanDue(
	intervalMinutes: number,
): Promise<boolean> {
	const last = await readInboxLastScan(await getDb());
	return !last || Date.now() - last.getTime() >= intervalMinutes * 60_000;
}
