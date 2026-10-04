import { spawn } from "node:child_process";
import type { LapEnd } from "../../../watch/decideLap";
import { WATCH_LAP_ARGS } from "../../../watch/runWatchLap";

export function runUpdateLap(
	cwd: string,
	onOutput: (text: string) => void,
): Promise<LapEnd> {
	return new Promise((resolve, reject) => {
		const { ASSIST_ACTIVITY_ID: _activity, ...env } = process.env;
		const child = spawn(
			process.execPath,
			[process.argv[1], ...WATCH_LAP_ARGS],
			{
				cwd,
				env,
				stdio: ["ignore", "pipe", "pipe"],
				windowsHide: true,
			},
		);
		const killWithDaemon = (): void => {
			child.kill();
		};
		process.on("exit", killWithDaemon);
		child.stdout.on("data", (chunk: Buffer) => onOutput(chunk.toString()));
		child.stderr.on("data", (chunk: Buffer) => onOutput(chunk.toString()));
		child.on("close", (code, signal) => {
			process.off("exit", killWithDaemon);
			resolve({ code, signal });
		});
		child.on("error", (error) => {
			process.off("exit", killWithDaemon);
			reject(error);
		});
	});
}
