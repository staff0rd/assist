import { unlinkSync, writeFileSync } from "node:fs";
import chalk from "chalk";
import { sweepRestrictedDir } from "../codeComment/sweepRestrictedDir";
import {
	getMigrationApprovalPath,
	getMigrationPinPath,
} from "./getMigrationPinPath";
import { readMigrationPinState } from "./readMigrationPinState";

export function dbMigrationConfirm(pin: string): void {
	sweepRestrictedDir();
	const state = readMigrationPinState(pin);
	if (!state) {
		console.error(chalk.red(`No pending migration unlock for pin: ${pin}`));
		process.exitCode = 1;
		return;
	}

	writeFileSync(
		getMigrationApprovalPath(state.migrationId),
		JSON.stringify({ migrationId: state.migrationId }),
	);
	unlinkSync(getMigrationPinPath(pin));

	console.log(
		chalk.green(
			`Approved creation of migration ${state.migrationId}. The next write of that migration module will be allowed once.`,
		),
	);
}
