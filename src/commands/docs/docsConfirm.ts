import { unlinkSync } from "node:fs";
import chalk from "chalk";
import { findPhaseUnlockItem } from "../backlog/findPhaseUnlockItem";
import { sweepRestrictedDir } from "../codeComment/sweepRestrictedDir";
import { getDocsUnlockPinPath } from "./getDocsUnlockPinPath";
import { readDocsUnlockPinState } from "./readDocsUnlockPinState";
import { recordDocsUnlock } from "./recordDocsUnlock";

export async function docsConfirm(pin: string): Promise<void> {
	sweepRestrictedDir();
	const state = readDocsUnlockPinState(pin);
	if (!state) {
		console.error(chalk.red(`No pending docs unlock for pin: ${pin}`));
		process.exitCode = 1;
		return;
	}
	unlinkSync(getDocsUnlockPinPath(pin));

	const found = await findPhaseUnlockItem(state.itemId, state.phase);
	if (!found) return;

	await recordDocsUnlock(found.orm, state.itemId, state.phase);
	console.log(
		chalk.green(
			`Approved docs changes for phase ${state.phase} of ${found.label}. Its sessions may edit and commit docs pages and screenshots until the item moves on from that phase or is done or won't-do.`,
		),
	);
}
