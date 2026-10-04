import { readFileSync, writeFileSync } from "node:fs";
import { daemonLog } from "../daemonLog";
import { watcherNote } from "../watcherNote";
import { appendWatcherLog } from "./appendWatcherLog";
import { watcherLogPath } from "./watcherLogPath";

const SCROLLBACK_TAIL = 256 * 1024;
const MAX_LOG_SIZE = 4 * 1024 * 1024;

function readLogTail(path: string): string {
	let log: string;
	try {
		log = readFileSync(path, "utf8");
	} catch {
		return "";
	}
	if (log.length > MAX_LOG_SIZE) {
		log = log.slice(-SCROLLBACK_TAIL);
		writeFileSync(path, log);
		daemonLog(`watcher log ${path} trimmed to its last ${log.length} chars`);
	}
	return log.slice(-SCROLLBACK_TAIL);
}

export function seedWatcherScrollback(cwd: string, event: string): string {
	const path = watcherLogPath(cwd);
	const history = readLogTail(path);
	const note = watcherNote(`${event} at ${new Date().toLocaleString()}`);
	appendWatcherLog({ watcher: true, cwd }, note);
	daemonLog(
		`watcher in ${cwd} seeded with ${history.length} chars of history from ${path} (${event})`,
	);
	return history + note;
}
