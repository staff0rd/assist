import chalk from "chalk";
import { statusIcon, typeLabel } from "../list/shared";
import { backlogExists, searchBacklog } from "../shared";

export async function search(query: string): Promise<void> {
	if (!backlogExists()) {
		console.log(
			chalk.yellow(
				"No backlog found. Run 'assist backlog init' to create one.",
			),
		);
		return;
	}

	const items = searchBacklog(query);
	if (items.length === 0) {
		console.log(chalk.dim(`No items matching "${query}".`));
		return;
	}

	console.log(
		chalk.dim(
			`${items.length} item${items.length === 1 ? "" : "s"} matching "${query}":\n`,
		),
	);
	for (const item of items) {
		console.log(
			`${statusIcon(item.status)} ${typeLabel(item.type)} ${chalk.dim(`#${item.id}`)} ${item.name}`,
		);
	}
}
