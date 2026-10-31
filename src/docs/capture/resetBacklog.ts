import { Client } from "pg";
import type { CaptureHome } from "./createCaptureHome";

export async function resetBacklog(capture: CaptureHome): Promise<void> {
	const client = new Client({ connectionString: capture.databaseUrl });
	await client.connect();
	try {
		await client.query(
			"TRUNCATE items, backups, usage_peaks, inbox_messages RESTART IDENTITY CASCADE",
		);
		await client.query("DELETE FROM metadata WHERE key = 'inbox.lastScanAt'");
	} finally {
		await client.end();
	}
}
