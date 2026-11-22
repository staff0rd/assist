import { existsSync, readFileSync } from "node:fs";
import { daemonLog } from "../daemonLog";
import type { AutopilotRecord } from "./AutopilotRecord";

export function loadAutopilotRecord(path: string): AutopilotRecord {
	if (!existsSync(path)) return {};
	try {
		const parsed = JSON.parse(readFileSync(path, "utf8")) as unknown;
		if (!parsed || typeof parsed !== "object" || Array.isArray(parsed))
			throw new Error("not an object");
		const record = parsed as AutopilotRecord;
		const live = Object.entries(record)
			.filter(([, repo]) => repo.current)
			.map(([cwd, repo]) => `${cwd} (${repo.current?.sessionId})`);
		daemonLog(
			`autopilot: restored tick record for ${Object.keys(record).length} repo(s)${live.length ? `; live run(s): ${live.join(", ")}` : ""}`,
		);
		return record;
	} catch (error) {
		daemonLog(`autopilot: reading ${path} failed: ${String(error)}`);
		return {};
	}
}
