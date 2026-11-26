import chalk from "chalk";
import { getDb } from "../../../shared/db/getDb";
import { appendComment } from "../appendComment";
import { createItemWithDefaults } from "../createItemWithDefaults";
import { formatItemId } from "../formatItemId";
import type { Predecessor } from "./findPredecessor";
import type { ProposedItem } from "./proposedItemSchema";
import { reviseProposedItem } from "./reviseProposedItem";
import type { ProposalTracker } from "./trackProposal";

async function tryRevise(
	predecessor: Predecessor,
	item: ProposedItem,
): Promise<boolean> {
	const outcome = predecessor.runStarted
		? "started"
		: await reviseProposedItem(predecessor.itemId, item);
	if (outcome === "started")
		console.log(
			chalk.yellow(
				`Item ${formatItemId(predecessor.itemId)} was already started from the earlier preview, so it is left unchanged and this proposal is added as a new item.`,
			),
		);
	return outcome === "revised";
}

export async function saveProposedItem(
	item: ProposedItem,
	tracker: ProposalTracker | undefined,
): Promise<number> {
	const predecessor = await tracker?.findPredecessor();
	if (predecessor && (await tryRevise(predecessor, item))) {
		tracker?.recordCreated(predecessor.itemId);
		await saveSummary(predecessor.itemId, item.summary);
		console.log(
			chalk.green(
				`Updated item ${formatItemId(predecessor.itemId)} with the revision (it was already created from the earlier preview): ${item.name}`,
			),
		);
		return predecessor.itemId;
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
