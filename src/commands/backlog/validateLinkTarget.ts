import chalk from "chalk";
import { formatItemId } from "./formatItemId";
import type { BacklogItem } from "./types";

/**
 * Validate that a proposed link is not already present on `fromItem`. Returns
 * `true` when the link is valid to add, logging the reason and returning `false`
 * otherwise. The target's existence is checked by the caller.
 */
export function validateLinkTarget(
	fromItem: BacklogItem,
	fromNum: number,
	toNum: number,
	linkType: string,
): boolean {
	const duplicate = (fromItem.links ?? []).some(
		(l) => l.targetId === toNum && l.type === linkType,
	);
	if (duplicate) {
		console.log(
			chalk.yellow(
				`Link already exists: ${formatItemId(fromNum)} ${linkType} ${formatItemId(toNum)}`,
			),
		);
		return false;
	}

	return true;
}
