import { ensureDaemonRunning } from "./ensureDaemonRunning";
import { stopDaemon } from "./stopDaemon";

export async function restartDaemon(): Promise<void> {
	await stopDaemon();
	await ensureDaemonRunning();
	console.log(
		"Sessions daemon restarted; previously running claude sessions will resume",
	);
}
