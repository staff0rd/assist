import chalk from "chalk";
import { formatItemId } from "../formatItemId";
import { originDisplayLabels } from "../originDisplayLabels";
import { loadBacklog } from "../shared";
import type { BacklogFile } from "../types";
import {
	dependencyLabel,
	phaseLabel,
	printVerboseDetails,
	starMarker,
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

function repoPrefixer(
	items: BacklogFile,
	allRepos: boolean,
): (item: BacklogFile[number]) => string {
	if (!allRepos) return () => "";
	const labels = originDisplayLabels(
		items.flatMap((i) => (i.origin ? [i.origin] : [])),
	);
	const repoNameOf = (item: BacklogFile[number]): string =>
		item.origin ? (labels.get(item.origin) ?? "") : "";
	const width = Math.max(0, ...items.map((i) => repoNameOf(i).length));
	return (item) => `${chalk.dim(repoNameOf(item).padEnd(width))} `;
}

export async function list(options: ListOptions): Promise<void> {
	const allItems = await loadBacklog(options.allRepos);
	const items = filterItems(allItems, options);
	if (items.length === 0) {
		console.log(chalk.dim("Backlog is empty."));
		return;
	}
	const prefixOf = repoPrefixer(items, !!options.allRepos);
	for (const item of items) {
		console.log(
			`${prefixOf(item)}${statusIcon(item.status)} ${typeLabel(item.type)} ${chalk.dim(formatItemId(item.id))} ${starMarker(item)}${item.name}${phaseLabel(item)}${dependencyLabel(item, allItems)}`,
		);
		if (options.verbose) {
			printVerboseDetails(item);
		}
	}
}
