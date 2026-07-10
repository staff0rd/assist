import chalk from "chalk";
import { deleteComment } from "../deleteComment";
import { formatItemId } from "../formatItemId";
import { findOneItem } from "../shared";

export async function deleteCommentCmd(
	id: string,
	commentId: string,
): Promise<void> {
	const found = await findOneItem(id);
	if (!found) process.exit(1);

	const itemId = found.item.id;
	const outcome = await deleteComment(
		found.orm,
		itemId,
		Number.parseInt(commentId, 10),
	);

	switch (outcome) {
		case "deleted":
			console.log(
				chalk.green(
					`Comment #${commentId} deleted from item ${formatItemId(itemId)}.`,
				),
			);
			break;
		case "not-found":
			console.log(
				chalk.red(
					`Comment #${commentId} not found on item ${formatItemId(itemId)}.`,
				),
			);
			process.exit(1);
			break;
		case "is-summary":
			console.log(
				chalk.red(
					`Comment #${commentId} is a phase summary and cannot be deleted.`,
				),
			);
			process.exit(1);
			break;
	}
}
