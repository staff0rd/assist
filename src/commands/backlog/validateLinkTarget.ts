import chalk from "chalk";
import type { BacklogFile, BacklogItem } from "./types";

export function validateLinkTarget(
	items: BacklogFile,
	fromItem: BacklogItem,
	fromId: string,
	toId: string,
	toNum: number,
	linkType: string,
): BacklogItem | undefined {
	const toItem = items.find((i) => i.id === toNum);
	if (!toItem) {
		console.log(chalk.red(`Item #${toId} not found.`));
		return undefined;
	}

	if (!fromItem.links) fromItem.links = [];

	const duplicate = fromItem.links.some(
		(l) => l.targetId === toNum && l.type === linkType,
	);
	if (duplicate) {
		console.log(
			chalk.yellow(`Link already exists: #${fromId} ${linkType} #${toId}`),
		);
		return undefined;
	}

	return toItem;
}
