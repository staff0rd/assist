import { appendFileSync, mkdirSync } from "node:fs";
import { dirname } from "node:path";
import type { Session } from "../types";
import { watcherLogPath } from "./watcherLogPath";

export function appendWatcherLog(
	session: Pick<Session, "watcher" | "cwd">,
	data: string,
): void {
	if (session.watcher !== true || !session.cwd) return;
	try {
		const path = watcherLogPath(session.cwd);
		mkdirSync(dirname(path), { recursive: true });
		appendFileSync(path, data);
	} catch {}
}
