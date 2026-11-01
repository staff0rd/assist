import { mkdirSync, unlinkSync, writeFileSync } from "node:fs";
import chalk from "chalk";
import { recordGitRef } from "../../shared/db/recordGitRef";
import { findPhaseUnlockItem } from "../backlog/findPhaseUnlockItem";
import { sweepRestrictedDir } from "../codeComment/sweepRestrictedDir";
import { phaseUnlockRef } from "../backlog/phaseUnlockRef";
import {
	getSchemaSessionApprovalDir,
	getSchemaSessionApprovalPath,
} from "./getSchemaSessionApprovalPath";
import { getSchemaUnlockPinPath } from "./getSchemaUnlockPinPath";
import { readSchemaUnlockPinState } from "./readSchemaUnlockPinState";

async function approveItemPhase(itemId: number, phase: number): Promise<void> {
	const found = await findPhaseUnlockItem(itemId, phase);
	if (!found) return;
	await recordGitRef(found.orm, itemId, {
		kind: "schema-unlock",
		ref: phaseUnlockRef(phase),
		title: `Database schema files unlocked by PIN for phase ${phase}`,
	});
	console.log(
		chalk.green(
			`Approved schema changes for phase ${phase} of ${found.label}. Its sessions may edit and commit database schema files until the item moves on from that phase or is done or won't-do.`,
		),
	);
}

function approveClaudeSession(claudeSessionId: string): void {
	const path = getSchemaSessionApprovalPath(claudeSessionId);
	if (!path) return;
	mkdirSync(getSchemaSessionApprovalDir(), { recursive: true });
	writeFileSync(path, JSON.stringify({ claudeSessionId }));
	console.log(
		chalk.green(
			`Approved schema changes for Claude session ${claudeSessionId}. It may edit and commit database schema files until the session ends.`,
		),
	);
}

export async function schemaConfirm(pin: string): Promise<void> {
	sweepRestrictedDir();
	const state = readSchemaUnlockPinState(pin);
	if (!state) {
		console.error(chalk.red(`No pending schema unlock for pin: ${pin}`));
		process.exitCode = 1;
		return;
	}
	unlinkSync(getSchemaUnlockPinPath(pin));

	if (state.kind === "item") await approveItemPhase(state.itemId, state.phase);
	else approveClaudeSession(state.claudeSessionId);
}
