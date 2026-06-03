import chalk from "chalk";
import { deleteComment } from "../deleteComment";
import { getBacklogOrm } from "../getBacklogOrm";
import { loadAndFindItem } from "../shared";

export async function deleteCommentCmd(
	id: string,
	commentId: string,
): Promise<void> {
	const result = await loadAndFindItem(id);
	if (!result) process.exit(1);

	const orm = await getBacklogOrm();
	const outcome = await deleteComment(
		orm,
		result.item.id,
		Number.parseInt(commentId, 10),
	);

	switch (outcome) {
		case "deleted":
			console.log(
				chalk.green(`Comment #${commentId} deleted from item #${id}.`),
			);
			break;
		case "not-found":
			console.log(chalk.red(`Comment #${commentId} not found on item #${id}.`));
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
