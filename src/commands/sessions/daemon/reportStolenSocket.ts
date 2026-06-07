import { readFileSync } from "node:fs";
import { daemonPaths } from "./daemonPaths";

export function reportStolenSocket(socketPid?: number): void {
	if (!socketPid) return;
	const filePid = readPidFile();
	if (filePid === undefined || filePid === socketPid) return;
	console.error(
		`Warning: daemon.pid records PID ${filePid} but the socket is owned by PID ${socketPid} (stolen socket)`,
	);
}

function readPidFile(): number | undefined {
	try {
		const pid = Number.parseInt(
			readFileSync(daemonPaths.pid, "utf-8").trim(),
			10,
		);
		return Number.isInteger(pid) ? pid : undefined;
	} catch {
		return undefined;
	}
}
