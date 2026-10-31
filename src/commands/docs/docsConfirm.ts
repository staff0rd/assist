import { unlinkSync } from "node:fs";
import chalk from "chalk";
import { formatItemId } from "../backlog/formatItemId";
import { findOneItem } from "../backlog/shared";
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

	const found = await findOneItem(String(state.itemId));
	if (!found) {
		process.exitCode = 1;
		return;
	}

	const label = `${formatItemId(state.itemId)} ${found.item.name}`;
	if (found.item.currentPhase !== state.phase) {
		console.error(
			chalk.red(
				`${label} has moved on from phase ${state.phase} since the unlock was requested. Nothing was approved; request a new unlock from the current phase.`,
			),
		);
		process.exitCode = 1;
		return;
	}

	await recordDocsUnlock(found.orm, state.itemId, state.phase);
	console.log(
		chalk.green(
			`Approved docs changes for phase ${state.phase} of ${label}. Its sessions may edit and commit docs pages and screenshots until the item moves on from that phase or is done or won't-do.`,
		),
	);
}
