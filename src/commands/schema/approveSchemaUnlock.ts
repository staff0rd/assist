import { mkdirSync, writeFileSync } from "node:fs";
import chalk from "chalk";
import { recordGitRef } from "../../shared/db/recordGitRef";
import { findPhaseUnlockItem } from "../backlog/findPhaseUnlockItem";
import { phaseUnlockRef } from "../backlog/phaseUnlockRef";
import {
	getSchemaSessionApprovalDir,
	getSchemaSessionApprovalPath,
	type SchemaSessionScope,
} from "./getSchemaSessionApprovalPath";
import type { SchemaUnlockPinState } from "./readSchemaUnlockPinState";
import { schemaHarnessLabel as labelOf } from "./schemaHarnessLabel";

type ItemState = Extract<SchemaUnlockPinState, { kind: "item" }>;

async function approveItemPhase({
	itemId,
	phase,
	harness,
}: ItemState): Promise<void> {
	const found = await findPhaseUnlockItem(itemId, phase);
	if (!found) return;
	await recordGitRef(found.orm, itemId, {
		kind: "schema-unlock",
		ref: phaseUnlockRef(phase, harness),
		title: `Database schema files unlocked by PIN for phase ${phase} (${labelOf(harness)})`,
	});
	console.log(
		chalk.green(
			`Approved schema changes for phase ${phase} of ${found.label} on ${labelOf(harness)}. Its ${labelOf(harness)} sessions may edit and commit database schema files until the item moves on from that phase or is done or won't-do.`,
		),
	);
}

function approveSession({ harness, conversationId }: SchemaSessionScope): void {
	const scope = { harness, conversationId };
	const path = getSchemaSessionApprovalPath(scope);
	if (!path) return;
	mkdirSync(getSchemaSessionApprovalDir(), { recursive: true });
	writeFileSync(path, JSON.stringify(scope));
	console.log(
		chalk.green(
			`Approved schema changes for ${labelOf(harness)} session ${conversationId}. It may edit and commit database schema files until the session ends.`,
		),
	);
}

export async function approveSchemaUnlock(
	state: SchemaUnlockPinState,
): Promise<void> {
	if (state.kind === "item") await approveItemPhase(state);
	else approveSession(state);
}
