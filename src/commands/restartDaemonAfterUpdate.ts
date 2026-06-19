import { isDaemonRunning } from "./sessions/daemon/connectToDaemon";
import { restartDaemon } from "./sessions/daemon/restartDaemon";

export async function restartDaemonAfterUpdate(): Promise<void> {
	if (!(await isDaemonRunning())) return;

	console.log("Restarting sessions daemon to load the new build...");
	try {
		await restartDaemon();
	} catch (error) {
		console.error(
			`Failed to restart sessions daemon: ${
				error instanceof Error ? error.message : String(error)
			}`,
		);
		process.exit(1);
	}
}
