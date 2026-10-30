import chalk from "chalk";
import type { Db } from "../../../shared/db/Db";
import { formatItemId } from "../formatItemId";
import type { BacklogItem } from "../types";
import { loadLinkTargets } from "./loadLinkTargets";

type Link = NonNullable<BacklogItem["links"]>[number];
type Target = Awaited<ReturnType<typeof loadLinkTargets>>[number];

function printSection(
	heading: string,
	links: Link[],
	targets: Target[],
	label: (link: Link) => string,
): void {
	if (links.length === 0) return;
	console.log(chalk.bold(heading));
	for (const link of links) {
		const target = targets.find((i) => i.id === link.targetId);
		const prefix = label(link);
		if (target) {
			console.log(
				`  ${prefix}${formatItemId(target.id)} ${target.name} ${chalk.dim(`(${target.status})`)}`,
			);
		} else {
			console.log(
				`  ${prefix}${formatItemId(link.targetId)} ${chalk.dim("(not found)")}`,
			);
		}
	}
	console.log();
}

export async function printLinks(orm: Db, item: BacklogItem): Promise<void> {
	const links = item.links ?? [];
	if (links.length === 0) return;

	const targets = await loadLinkTargets(
		orm,
		links.map((l) => l.targetId),
	);

	printSection(
		"Links",
		links.filter((l) => l.type !== "docs-refresh"),
		targets,
		(link) =>
			`${link.type === "depends-on" ? chalk.red(link.type) : chalk.blue(link.type)} `,
	);
	printSection(
		"Refreshes docs for",
		links.filter((l) => l.type === "docs-refresh"),
		targets,
		() => "",
	);
}
