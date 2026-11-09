import chalk from "chalk";
import { currentExecutionIdentity } from "../../shared/currentExecutionIdentity";
import type { ExecutionIdentity } from "../../shared/harnessAdapters/types";
import { formatItemId } from "../backlog/formatItemId";
import { findOneItem } from "../backlog/shared";
import { getSchemaSessionApprovalPath } from "./getSchemaSessionApprovalPath";
import { schemaHarnessLabel as labelOf } from "./schemaHarnessLabel";

type UnlockScope = {
	label: string;
	scope: string;
	state: Record<string, unknown>;
};

function fail(message: string): undefined {
	console.error(chalk.red(message));
	process.exitCode = 1;
	return undefined;
}

async function itemScope(
	itemId: number,
	harness: string,
): Promise<UnlockScope | undefined> {
	const found = await findOneItem(String(itemId));
	if (!found) return undefined;
	const phase = found.item.currentPhase ?? 1;
	const label = `${formatItemId(itemId)} ${found.item.name} (phase ${phase}, ${labelOf(harness)})`;
	return {
		label,
		scope: `this phase of ${label}`,
		state: { itemId, phase, harness },
	};
}

function sessionScope({
	harness,
	conversationId,
}: ExecutionIdentity): UnlockScope | undefined {
	if (
		!conversationId ||
		getSchemaSessionApprovalPath({ harness, conversationId }) === undefined
	)
		return fail(
			`No backlog item (ASSIST_BACKLOG_ITEM_ID) and no ${labelOf(harness)} conversation id to scope the schema unlock to.`,
		);
	const label = `${labelOf(harness)} session ${conversationId}`;
	return { label, scope: label, state: { harness, conversationId } };
}

export async function resolveSchemaUnlockScope(): Promise<
	UnlockScope | undefined
> {
	const identity = currentExecutionIdentity();
	if (!identity)
		return fail(
			"Not running inside a harness session, so there is no session to scope the schema unlock to; schema files are not locked here.",
		);
	if (identity.itemId === null) return sessionScope(identity);
	const scope = await itemScope(identity.itemId, identity.harness);
	if (!scope) process.exitCode = 1;
	return scope;
}
