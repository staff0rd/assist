import { execSync } from "node:child_process";

export function readCrontab(): string {
	try {
		return execSync("crontab -l", {
			encoding: "utf8",
			stdio: ["ignore", "pipe", "ignore"],
		});
	} catch {
		return "";
	}
}

export function writeCrontab(content: string): void {
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
