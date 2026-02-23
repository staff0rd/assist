import { existsSync, readFileSync } from "node:fs";
import { voicePaths } from "./shared";

function isProcessAlive(pid: number): boolean {
	try {
		process.kill(pid, 0);
		return true;
	} catch {
		return false;
	}
}

function readRecentLogs(count: number): string[] {
	if (!existsSync(voicePaths.log)) return [];
	const lines = readFileSync(voicePaths.log, "utf-8").trim().split("\n");
	return lines.slice(-count);
}

export function status(): void {
	if (!existsSync(voicePaths.pid)) {
		console.log("Voice daemon: not running (no PID file)");
		return;
	}

	const pid = Number.parseInt(readFileSync(voicePaths.pid, "utf-8").trim(), 10);
	const alive = isProcessAlive(pid);

	console.log(`Voice daemon: ${alive ? "running" : "dead"} (PID ${pid})`);

	const recent = readRecentLogs(5);
	if (recent.length > 0) {
		console.log("\nRecent events:");
		for (const line of recent) {
			try {
				const event = JSON.parse(line);
				const time = event.timestamp?.slice(11, 19) ?? "";
				console.log(`  ${time} [${event.event}] ${event.message ?? ""}`);
			} catch {
				console.log(`  ${line}`);
			}
		}
	}
}
