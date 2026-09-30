import chalk from "chalk";
import { appendDaemonLog } from "../sessions/daemon/appendDaemonLog";
import type { LockHolder } from "./acquireLock";
import { duplicateRunExitCode } from "./duplicateRunExitCode";
import { formatItemId } from "./formatItemId";

export function reportDuplicateRun(itemId: number, holder: LockHolder): void {
	const since = holder.timestamp ? `, started ${holder.timestamp}` : "";
	const reason =
		`another session is already running it (pid ${holder.pid}${since}); ` +
		`close that session before running it again`;
	console.log(chalk.yellow(`Already running: ${formatItemId(itemId)}`));
	console.log(chalk.dim(`Refusing to start a second run — ${reason}.`));
	appendDaemonLog(`backlog run ${itemId}: refused — ${reason}`);
	process.exitCode = duplicateRunExitCode;
}
