import { renameSync, writeFileSync } from "node:fs";
import { daemonLog } from "../daemonLog";
import type { AutopilotRecord } from "./AutopilotRecord";

export function saveAutopilotRecord(
	path: string,
	record: AutopilotRecord,
): void {
	try {
		const temp = `${path}.tmp`;
		writeFileSync(temp, `${JSON.stringify(record, null, 2)}\n`);
		renameSync(temp, path);
	} catch (error) {
		daemonLog(`autopilot: saving ${path} failed: ${String(error)}`);
	}
}
