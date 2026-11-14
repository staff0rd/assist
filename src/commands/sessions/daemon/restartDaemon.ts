import { waitForBuild } from "../../../build/waitForBuild";
import { ensureDaemonRunning } from "./ensureDaemonRunning";
import { stopDaemon } from "./stopDaemon";

export async function restartDaemon(): Promise<void> {
	// why: stopping only after the build keeps sessions running through it
	await waitForBuild();
	await stopDaemon();
	await ensureDaemonRunning("daemon restart");
	console.log(
		"Sessions daemon restarted; previously running claude sessions will resume",
	);
}
