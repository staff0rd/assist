import { spawn } from "node:child_process";
import type { LapEnd } from "./decideLap";

export const WATCH_LAP_ARGS = ["watch", "wait", "--pull", "--build"];

export function runWatchLap(): Promise<LapEnd> {
	return new Promise((resolve, reject) => {
		const assistFromPath = spawn("assist", WATCH_LAP_ARGS, {
			stdio: "inherit",
			shell: process.platform === "win32",
		});
		assistFromPath.on("close", (code, signal) => resolve({ code, signal }));
		assistFromPath.on("error", reject);
	});
}
