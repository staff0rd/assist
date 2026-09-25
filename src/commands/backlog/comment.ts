import chalk from "chalk";
import { appendComment } from "./appendComment";
import { formatItemId } from "./formatItemId";
import { findOneItem } from "./shared";
import { reviewProposedComment } from "./comment/reviewProposedComment";

export async function comment(id: string, text: string): Promise<void> {
	const found = await findOneItem(id);
	if (!found) process.exit(1);

	await reviewProposedComment(found.item, text);

	await appendComment(found.orm, found.item.id, text);
	console.log(
		chalk.green(`Comment added to item ${formatItemId(found.item.id)}.`),
	);
}
