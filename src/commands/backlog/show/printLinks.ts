import chalk from "chalk";
import type { BacklogOrm } from "../BacklogOrm";
import type { BacklogItem } from "../types";
import { loadLinkTargets } from "./loadLinkTargets";

export async function printLinks(
	orm: BacklogOrm,
	item: BacklogItem,
): Promise<void> {
	const links = item.links ?? [];
	if (links.length === 0) return;

	const targets = await loadLinkTargets(
		orm,
		links.map((l) => l.targetId),
	);

	console.log(chalk.bold("Links"));
	for (const link of links) {
		const target = targets.find((i) => i.id === link.targetId);
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
