import chalk from "chalk";
import { originDisplayLabels } from "../originDisplayLabels";
import { loadBacklog } from "../shared";
import type { BacklogFile } from "../types";
import {
	dependencyLabel,
	phaseLabel,
	printVerboseDetails,
	statusIcon,
	typeLabel,
} from "./shared";

type ListOptions = {
	status?: string;
	all?: boolean;
	allRepos?: boolean;
	verbose?: boolean;
};

function filterItems(items: BacklogFile, options: ListOptions): BacklogFile {
	if (options.status) return items.filter((i) => i.status === options.status);
	if (!options.all)
		return items.filter((i) => i.status !== "done" && i.status !== "wontdo");
	return items;
}

export async function list(options: ListOptions): Promise<void> {
	const allItems = await loadBacklog(options.allRepos);
	const items = filterItems(allItems, options);
	if (items.length === 0) {
		console.log(chalk.dim("Backlog is empty."));
		return;
	}
	// Resolve a collision-aware label per origin (bare repo name when unique,
	// org/repo when it collides), then pad every prefix to the widest resolved
	// label so the status icons stay in a readable column.
	const labels = originDisplayLabels(
		items.flatMap((i) => (i.origin ? [i.origin] : [])),
	);
	const repoNameOf = (item: BacklogFile[number]): string =>
		item.origin ? (labels.get(item.origin) ?? "") : "";
	const prefixWidth = options.allRepos
		? Math.max(0, ...items.map((i) => repoNameOf(i).length))
		: 0;
	for (const item of items) {
		const repoPrefix = options.allRepos
			? `${chalk.dim(repoNameOf(item).padEnd(prefixWidth))} `
			: "";
		console.log(
			`${repoPrefix}${statusIcon(item.status)} ${typeLabel(item.type)} ${chalk.dim(`#${item.id}`)} ${item.name}${phaseLabel(item)}${dependencyLabel(item, allItems)}`,
		);
		if (options.verbose) {
			printVerboseDetails(item);
		}
	}
}
