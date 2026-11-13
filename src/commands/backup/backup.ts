import { mkdir, stat } from "node:fs/promises";
import { join, resolve } from "node:path";
import chalk from "chalk";
import { getDb } from "../../shared/db/getDb";
import { recordBackup } from "../../shared/db/recordBackup";
import { expandTilde } from "../../shared/expandTilde";
import { loadConfig } from "../../shared/loadConfig";
import { exportBacklog } from "../backlog/exportBacklog";

type BackupOptions = { out?: string };

export /**
 * Write a backlog database dump to the configured (or `--out`) directory and,
 * on success, record the dump's path and byte size in the backups table. If the
 * dump fails the error propagates and no row is inserted.
 */
async function backup({ out }: BackupOptions): Promise<void> {
	const dir = expandTilde(out ?? loadConfig().backup.dir);
	await mkdir(dir, { recursive: true });

	const start = Date.now();
	const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
	const filePath = resolve(join(dir, `backup-${timestamp}.dump`));

	await exportBacklog(filePath);

	const { size } = await stat(filePath);
	const durationMs = Date.now() - start;
	const db = await getDb();
	await recordBackup(db, { filePath, sizeBytes: size, durationMs });

	const elapsed = (durationMs / 1000).toFixed(1);
	console.error(
		chalk.green(`Recorded backup ${filePath} (${size} bytes) in ${elapsed}s.`),
	);
}
