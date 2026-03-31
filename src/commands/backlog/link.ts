import chalk from "chalk";
import { hasCycle } from "./hasCycle";
import { loadAndFindItem, saveBacklog } from "./shared";
import type { BacklogLinkType } from "./types";
import { validateLinkTarget } from "./validateLinkTarget";

export function link(
	fromId: string,
	toId: string,
	opts: { type?: string },
): void {
	const linkType = (opts.type ?? "relates-to") as BacklogLinkType;
	if (linkType !== "relates-to" && linkType !== "depends-on") {
		console.log(chalk.red(`Invalid link type: ${linkType}`));
		return;
	}

	const fromNum = Number.parseInt(fromId, 10);
	const toNum = Number.parseInt(toId, 10);

	if (fromNum === toNum) {
		console.log(chalk.red("Cannot link an item to itself."));
		return;
	}

	const result = loadAndFindItem(fromId);
	if (!result) return;
	const { items, item: fromItem } = result;

	const toItem = validateLinkTarget(
		items,
		fromItem,
		fromId,
		toId,
		toNum,
		linkType,
	);
	if (!toItem) return;

	if (linkType === "depends-on" && hasCycle(items, fromNum, toNum)) {
		console.log(
			chalk.red(
				`Cannot add dependency: #${fromId} → #${toId} would create a circular dependency.`,
			),
		);
		return;
	}

	if (!fromItem.links) fromItem.links = [];
	fromItem.links.push({ type: linkType, targetId: toNum });
	saveBacklog(items);
	console.log(
		chalk.green(`Linked #${fromId} ${linkType} #${toId} (${toItem.name})`),
	);
}
