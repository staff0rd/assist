import chalk from "chalk";
import { and, eq } from "drizzle-orm";
import { itemGitRefs } from "../../shared/db/schema";
import { formatItemId } from "../backlog/formatItemId";
import { phaseUnlockRef } from "../backlog/phaseUnlockRef";
import { findOneItem } from "../backlog/shared";
import { schemaHarnessLabel as labelOf } from "./schemaHarnessLabel";

export async function lockItemPhase(
	itemId: number,
	harness: string,
): Promise<void> {
	const found = await findOneItem(String(itemId));
	if (!found) {
		process.exitCode = 1;
		return;
	}
	const phase = found.item.currentPhase ?? 1;
	const label = `phase ${phase} of ${formatItemId(itemId)} ${found.item.name} on ${labelOf(harness)}`;
	const removed = await found.orm
		.delete(itemGitRefs)
		.where(
			and(
				eq(itemGitRefs.itemId, itemId),
				eq(itemGitRefs.kind, "schema-unlock"),
				eq(itemGitRefs.ref, phaseUnlockRef(phase, harness)),
			),
		)
		.returning({ itemId: itemGitRefs.itemId });
	console.log(
		removed.length > 0
			? chalk.green(`Revoked schema approval for ${label}.`)
			: `No schema approval to revoke for ${label}.`,
	);
}
