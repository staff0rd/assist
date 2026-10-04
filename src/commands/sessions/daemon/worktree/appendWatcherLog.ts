import { appendFileSync, mkdirSync } from "node:fs";
import { dirname } from "node:path";
import { watcherLogPath } from "./watcherLogPath";

export function appendWatcherLog(cwd: string, data: string): void {
	try {
		const path = watcherLogPath(cwd);
		mkdirSync(dirname(path), { recursive: true });
		appendFileSync(path, data);
	} catch {}
}
