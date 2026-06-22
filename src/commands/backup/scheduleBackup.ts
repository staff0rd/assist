import { execSync } from "node:child_process";
import { mkdir } from "node:fs/promises";
import { join } from "node:path";
import chalk from "chalk";
import { expandTilde } from "../../shared/expandTilde";
import { loadConfig } from "../../shared/loadConfig";
import { durationToCron } from "./durationToCron";
import { resolveAssistCommand } from "./resolveAssistCommand";
import { readScheduleBlock, upsertScheduleBlock } from "./upsertScheduleBlock";

function readCrontab(): string {
	try {
		return execSync("crontab -l", {
			encoding: "utf8",
			stdio: ["ignore", "pipe", "ignore"],
		});
	} catch {
		return "";
	}
}

function writeCrontab(content: string): void {
	try {
		execSync("crontab -", {
			input: content,
			stdio: ["pipe", "ignore", "pipe"],
		});
	} catch (error) {
		if ((error as NodeJS.ErrnoException).code === "ENOENT") {
			throw new Error(
				"crontab is not available on this system. Backup scheduling requires Linux cron.",
			);
		}
		throw error;
	}
}

function fail(message: string): never {
	console.error(chalk.red(message));
	process.exit(1);
}

export async function scheduleBackup({
	every,
}: {
	every?: string;
}): Promise<void> {
	if (!every) {
		fail(
			"Missing --every <duration>. Run `assist backup schedule --every 6h`, or `assist backup schedule status` to inspect the current schedule.",
		);
	}

	try {
		const cronExpr = durationToCron(every);
		const dir = expandTilde(loadConfig().backup.dir);
		await mkdir(dir, { recursive: true });

		const logPath = join(dir, "cron.log");
		const cronLine = `${cronExpr} ${resolveAssistCommand()} backup >> ${logPath} 2>&1`;
		writeCrontab(upsertScheduleBlock(readCrontab(), every, cronLine));

		console.error(
			chalk.green(
				`Scheduled assist backup every ${every} (${cronExpr}). Output is appended to ${logPath}.`,
			),
		);
	} catch (error) {
		fail((error as Error).message);
	}
}

export function scheduleStatus(): void {
	const block = readScheduleBlock(readCrontab());
	if (!block) {
		console.error(
			"No assist backup schedule is set. Run `assist backup schedule --every <duration>` to install one.",
		);
		return;
	}
	console.error(`assist backup runs every ${block.every} (${block.cron}).`);
}
