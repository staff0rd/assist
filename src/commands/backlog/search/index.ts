import chalk from "chalk";
import { formatItemId } from "../formatItemId";
import { statusIcon, typeLabel } from "../list/shared";
import { searchBacklog } from "../shared";

export async function search(query: string): Promise<void> {
	const items = await searchBacklog(query);
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
			`${statusIcon(item.status)} ${typeLabel(item.type)} ${chalk.dim(formatItemId(item.id))} ${item.name}`,
		);
	}
}
