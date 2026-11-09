import { unlinkSync } from "node:fs";
import chalk from "chalk";
import { currentExecutionIdentity } from "../../shared/currentExecutionIdentity";
import type { ExecutionIdentity } from "../../shared/harnessAdapters/types";
import { sweepRestrictedDir } from "../codeComment/sweepRestrictedDir";
import { approveSchemaUnlock } from "./approveSchemaUnlock";
import { getSchemaUnlockPinPath } from "./getSchemaUnlockPinPath";
import {
	readSchemaUnlockPinState,
	type SchemaUnlockPinState,
} from "./readSchemaUnlockPinState";

function scopeMismatch(
	state: SchemaUnlockPinState,
	current: ExecutionIdentity | undefined,
): boolean {
	if (!current) return false;
	if (current.harness !== state.harness) return true;
	return state.kind === "item"
		? current.itemId !== state.itemId
		: current.itemId !== null ||
				current.conversationId !== state.conversationId;
}

export async function schemaConfirm(pin: string): Promise<void> {
	sweepRestrictedDir();
	const state = readSchemaUnlockPinState(pin);
	if (!state) {
		console.error(chalk.red(`No pending schema unlock for pin: ${pin}`));
		process.exitCode = 1;
		return;
	}
	if (scopeMismatch(state, currentExecutionIdentity())) {
		console.error(
			chalk.red(
				"This pin was issued for a different session. Nothing was approved; confirm it in the session that requested it, or request a new unlock here.",
			),
		);
		process.exitCode = 1;
		return;
	}
	unlinkSync(getSchemaUnlockPinPath(pin));
	await approveSchemaUnlock(state);
}
