import chalk from "chalk";
import type { BacklogFile, BacklogItem } from "../types";

export function printLinks(item: BacklogItem, items: BacklogFile): void {
	const links = item.links ?? [];
	if (links.length === 0) return;

	console.log(chalk.bold("Links"));
	for (const link of links) {
		const target = items.find((i) => i.id === link.targetId);
		const typeLabel =
			link.type === "depends-on"
				? chalk.red("depends-on")
				: chalk.blue("relates-to");
		if (target) {
			console.log(
				`  ${typeLabel} #${target.id} ${target.name} ${chalk.dim(`(${target.status})`)}`,
			);
		} else {
			console.log(
				`  ${typeLabel} #${link.targetId} ${chalk.dim("(not found)")}`,
			);
		}
	}
	console.log();
}
