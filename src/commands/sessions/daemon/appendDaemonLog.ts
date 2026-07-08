import { appendFileSync } from "node:fs";
import { daemonPaths } from "./daemonPaths";

export function appendDaemonLog(message: string): void {
	const line = `${new Date().toISOString()} [${process.pid}] ${message}`;
	try {
		appendFileSync(daemonPaths.log, `${line}\n`);
	} catch {}
}
