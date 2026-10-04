import { readFileSync, writeFileSync } from "node:fs";
import { daemonLog } from "../daemonLog";
import { watcherLogPath } from "../worktree/watcherLogPath";

const KEEP_TAIL = 256 * 1024;
const MAX_LOG_SIZE = 4 * 1024 * 1024;

export function trimWatcherLog(cwd: string): void {
	const path = watcherLogPath(cwd);
	let log: string;
	try {
		log = readFileSync(path, "utf8");
	} catch {
		return;
	}
	if (log.length <= MAX_LOG_SIZE) return;
	writeFileSync(path, log.slice(-KEEP_TAIL));
	daemonLog(`auto-update: log ${path} trimmed to its last ${KEEP_TAIL} chars`);
}
