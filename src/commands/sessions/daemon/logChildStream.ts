import { createInterface } from "node:readline";
import type { Readable } from "node:stream";
import { daemonLog } from "./daemonLog";

// Pipes a child process's stdout/stderr into daemon.log, line by line, so a
// failed Windows-host launch or update is observable instead of discarded.
export function logChildStream(stream: Readable | null, label: string): void {
	if (!stream) return;
	const lines = createInterface({ input: stream });
	lines.on("line", (line) => daemonLog(`[${label}] ${line}`));
	lines.on("error", () => {});
}
