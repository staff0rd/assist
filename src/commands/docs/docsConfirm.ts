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

	await recordDocsUnlock(found.orm, state.itemId);
	console.log(
		chalk.green(
			`Approved docs changes for ${formatItemId(state.itemId)} ${found.item.name}. Its sessions may edit and commit docs pages and screenshots until it is done or won't-do.`,
		),
	);
}
