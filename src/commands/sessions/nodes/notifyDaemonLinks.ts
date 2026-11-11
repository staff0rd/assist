import chalk from "chalk";
import { reloadDaemonLinks } from "./reloadDaemonLinks";

export async function notifyDaemonLinks(): Promise<void> {
	const result = await reloadDaemonLinks();
	if (result.kind === "not-running")
		console.log(
			chalk.yellow(
				"The sessions daemon is not running; it loads the links when it starts.",
			),
		);
	else if (result.kind === "reloaded")
		console.log(chalk.dim("The sessions daemon reloaded its links."));
	else
		console.log(
			chalk.yellow(
				`Could not notify the sessions daemon (${result.message}); run \`assist daemon restart\` to apply the change.`,
			),
		);
}
