import chalk from "chalk";
import type { MenuItem } from "./menuItems";

export type RestartActions = {
	runRestartDaemon: () => Promise<void>;
	reExec: () => void;
};

export async function runRestartItem(
	item: MenuItem,
	{ runRestartDaemon, reExec }: RestartActions,
): Promise<void> {
	if (item.disabled) return;
	try {
		if (item.action === "restart-daemon" || item.action === "restart-both") {
			console.log(chalk.cyan("Restarting sessions daemon…"));
			await runRestartDaemon();
		}
		if (item.action === "restart-webserver" || item.action === "restart-both") {
			console.log(chalk.cyan("Restarting web server…"));
			reExec();
		}
	} catch (error) {
		const message = error instanceof Error ? error.message : String(error);
		console.error(chalk.red(`Restart failed: ${message}`));
	}
}
