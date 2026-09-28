import chalk from "chalk";
import { isDaemonRunning } from "../daemon/connectToDaemon";
import { sendToDaemonAwaitAck } from "../daemon/sendToDaemonAwaitAck";

export async function notifyDaemonLinks(): Promise<void> {
	if (!(await isDaemonRunning())) {
		console.log(
			chalk.yellow(
				"The sessions daemon is not running; it loads the links when it starts.",
			),
		);
		return;
	}
	try {
		await sendToDaemonAwaitAck({ type: "reload-links" });
		console.log(chalk.dim("The sessions daemon reloaded its links."));
	} catch (error) {
		const message = error instanceof Error ? error.message : String(error);
		console.log(
			chalk.yellow(
				`Could not notify the sessions daemon (${message}); run \`assist daemon restart\` to apply the change.`,
			),
		);
	}
}
