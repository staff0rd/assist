import { closeSync, openSync } from "node:fs";
import { join } from "node:path";
import { runAssist } from "./runAssist";
import { spawnAssist } from "./spawnAssist";
import type { CaptureHome } from "./createCaptureHome";
import { findFreePort } from "../../shared/findFreePort";
import { waitForHttp } from "./waitForHttp";

const READY_TIMEOUT_MS = 30_000;

type CaptureServer = { url: string; stop: () => Promise<void> };

export async function startCaptureServer(
	capture: CaptureHome,
): Promise<CaptureServer> {
	const port = await findFreePort();
	const url = `http://localhost:${port}`;
	const log = join(capture.home, "web.log");
	const logFd = openSync(log, "a");
	const web = spawnAssist(
		capture,
		["sessions", "web", "--port", String(port), "--no-open"],
		["ignore", logFd, logFd],
	);
	closeSync(logFd);
	const exited = new Promise<void>((resolve) => web.once("exit", resolve));

	const stop = async () => {
		runAssist(capture, ["daemon", "stop"]);
		web.kill();
		await exited;
	};
	try {
		await waitForHttp(url, log, {
			label: "Web server",
			timeoutMs: READY_TIMEOUT_MS,
		});
	} catch (error) {
		await stop();
		throw error;
	}
	return { url, stop };
}
