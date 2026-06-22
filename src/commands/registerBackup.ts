import { mkdir, stat } from "node:fs/promises";
import { join, resolve } from "node:path";
import chalk from "chalk";
import type { Command } from "commander";
import { getDb } from "../shared/db/getDb";
import { recordBackup } from "../shared/db/recordBackup";
import { expandTilde } from "../shared/expandTilde";
import { loadConfig } from "../shared/loadConfig";
import { scheduleBackup, scheduleStatus } from "./backup/scheduleBackup";
import { exportBacklog } from "./backlog/export";

type BackupOptions = { out?: string };

/**
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

export function registerBackup(program: Command): void {
	const backupCommand = program
		.command("backup")
		.description(
			"Write a backlog database dump and record it in the backups table",
		)
		.option(
			"-o, --out <dir>",
			"Directory to write the dump to (overrides the backup.dir config)",
		)
		.action(backup);

	const scheduleCommand = backupCommand
		.command("schedule")
		.description("Manage a recurring crontab entry that runs assist backup")
		.option("--every <duration>", "Cadence to run the backup (e.g. 5m, 6h)")
		.action(scheduleBackup);

	scheduleCommand
		.command("status")
		.description("Show the active backup schedule, or report that none is set")
		.action(scheduleStatus);
}
