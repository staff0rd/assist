import chalk from "chalk";
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
	for (const item of items) {
		console.log(
			`${statusIcon(item.status)} ${typeLabel(item.type)} ${chalk.dim(`#${item.id}`)} ${item.name}${phaseLabel(item)}${dependencyLabel(item, allItems)}`,
		);
		if (options.verbose) {
			printVerboseDetails(item);
		}
	}
}
