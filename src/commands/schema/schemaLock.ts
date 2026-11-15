import { existsSync, unlinkSync } from "node:fs";
import chalk from "chalk";
import { currentExecutionIdentity } from "../../shared/currentExecutionIdentity";
import { closeDb } from "../../shared/db/getDb";
import type { ExecutionIdentity } from "../../shared/harnessAdapters/types";
import { getSchemaSessionApprovalPath } from "./getSchemaSessionApprovalPath";
import { schemaHarnessLabel as labelOf } from "./schemaHarnessLabel";
import { lockItemPhase } from "./lockItemPhase";

function lockSession({ harness, conversationId }: ExecutionIdentity): void {
	const path = conversationId
		? getSchemaSessionApprovalPath({ harness, conversationId })
		: undefined;
	const label = `${labelOf(harness)} session ${conversationId}`;
	if (!path || !existsSync(path)) {
		console.log(`No schema approval to revoke for ${label}.`);
		return;
	}
	unlinkSync(path);
	console.log(chalk.green(`Revoked schema approval for ${label}.`));
}

export async function schemaLock(): Promise<void> {
	const identity = currentExecutionIdentity();
	if (!identity) {
		console.error(
			chalk.red(
				"Not running inside a harness session, so there is no schema approval to revoke.",
			),
		);
		process.exitCode = 1;
		return;
	}
	if (identity.itemId === null) {
		lockSession(identity);
		return;
	}
	try {
		await lockItemPhase(identity.itemId, identity.harness);
	} finally {
		await closeDb().catch(() => {});
	}
}
