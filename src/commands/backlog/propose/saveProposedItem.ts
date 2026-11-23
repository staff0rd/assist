import chalk from "chalk";
import { getDb } from "../../../shared/db/getDb";
import { appendComment } from "../appendComment";
import { createItemWithDefaults } from "../createItemWithDefaults";
import { formatItemId } from "../formatItemId";
import type { ProposedItem } from "./proposedItemSchema";
import { reviseProposedItem } from "./reviseProposedItem";
import type { ProposalTracker } from "./trackProposal";

export async function saveProposedItem(
	item: ProposedItem,
	tracker: ProposalTracker | undefined,
): Promise<number> {
	const predecessor = await tracker?.findPredecessor();
	if (
		predecessor !== undefined &&
		(await reviseProposedItem(predecessor, item))
	) {
		tracker?.recordCreated(predecessor);
		await saveSummary(predecessor, item.summary);
		console.log(
			chalk.green(
				`Updated item ${formatItemId(predecessor)} with the revision (it was already created from the earlier preview): ${item.name}`,
			),
		);
		return predecessor;
	}

	const id = await createItemWithDefaults(item);
	tracker?.recordCreated(id);
	await saveSummary(id, item.summary);
	console.log(chalk.green(`Added item ${formatItemId(id)}: ${item.name}`));
	return id;
}

async function saveSummary(id: number, summary: string | undefined) {
	if (summary) await appendComment(await getDb(), id, summary, { type: "why" });
}
