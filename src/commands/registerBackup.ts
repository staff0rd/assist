import { mkdir, stat } from "node:fs/promises";
import { homedir } from "node:os";
import { join } from "node:path";
import chalk from "chalk";
import type { Command } from "commander";
import { getDb } from "../shared/db/getDb";
import { recordBackup } from "../shared/db/recordBackup";
import { loadConfig } from "../shared/loadConfig";
import { exportBacklog } from "./backlog/export";

function expandTilde(value: string): string {
	return value.startsWith("~/") ? homedir() + value.slice(1) : value;
}

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
	const filePath = join(dir, `backup-${timestamp}.dump`);

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
	program
		.command("backup")
		.description(
			"Write a backlog database dump and record it in the backups table",
		)
		.option(
			"--out <dir>",
			"Directory to write the dump to (overrides the backup.dir config)",
		)
		.action(backup);
}
