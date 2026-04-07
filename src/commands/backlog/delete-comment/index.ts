import chalk from "chalk";
import { deleteComment } from "../deleteComment";
import { exportToJsonl } from "../exportToJsonl";
import { openDb } from "../openDb";
import { getBacklogDir, loadAndFindItem } from "../shared";

export function deleteCommentCmd(id: string, commentId: string): void {
	const result = loadAndFindItem(id);
	if (!result) process.exit(1);

	const dir = getBacklogDir();
	const db = openDb(dir);
	const outcome = deleteComment(
		db,
		result.item.id,
		Number.parseInt(commentId, 10),
	);

	switch (outcome) {
		case "deleted":
			exportToJsonl(db, dir);
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
