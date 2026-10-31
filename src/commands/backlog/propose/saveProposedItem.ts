import chalk from "chalk";
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
		console.log(
			chalk.green(
				`Updated item ${formatItemId(predecessor)} with the revision (it was already created from the earlier preview): ${item.name}`,
			),
		);
		return predecessor;
	}

	const id = await createItemWithDefaults(item);
	tracker?.recordCreated(id);
	console.log(chalk.green(`Added item ${formatItemId(id)}: ${item.name}`));
	return id;
}
