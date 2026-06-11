import chalk from "chalk";
import { createLogUpdate } from "log-update";
import { createActivate } from "./createActivate";
import { createKeyHandler } from "./createKeyHandler";
import { createMenuState } from "./createMenuState";
import { enableRawMode } from "./enableRawMode";
import { type RestartMenuOptions, resolveOptions } from "./resolveOptions";

export function installRestartMenu(
	options: RestartMenuOptions = {},
): () => void {
	const { stdin, out, toggleKey, exit, restartDaemonFn, reExecFn, items } =
		resolveOptions(options);
	if (!stdin.isTTY) return () => {};

	const log = createLogUpdate(out);
	const menu = createMenuState(items, log);
	const reExec = () => reExecFn({ beforeExec: () => cleanup(), exit });
	const { isBusy, activate } = createActivate(menu, {
		runRestartDaemon: restartDaemonFn,
		reExec,
	});

	const handler = createKeyHandler({
		menu,
		toggleKey,
		isBusy,
		activate,
		quit: () => {
			cleanup();
			exit(130);
		},
	});
	const restoreRaw = enableRawMode(stdin, handler);
	console.log(chalk.dim("Press Ctrl+R for the restart menu"));

	let cleaned = false;
	function cleanup(): void {
		if (cleaned) return;
		cleaned = true;
		menu.close();
		restoreRaw();
		process.removeListener("exit", cleanup);
	}
	process.on("exit", cleanup);

	return cleanup;
}
