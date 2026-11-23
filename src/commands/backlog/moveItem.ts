import chalk from "chalk";
import { formatItemId, parseItemId } from "./formatItemId";
import { type ItemPlacement, reorderItem } from "./reorderItem";
import { getReady } from "./shared";

type MoveItemOptions = {
	before?: string;
	after?: string;
	top?: boolean;
	bottom?: boolean;
};

function toPlacements(options: MoveItemOptions): ItemPlacement[] {
	const placements: ItemPlacement[] = [];
	if (options.before !== undefined)
		placements.push({
			side: "before",
			targetId: parseItemId(options.before),
		});
	if (options.after !== undefined)
		placements.push({ side: "after", targetId: parseItemId(options.after) });
	if (options.top) placements.push({ edge: "top" });
	if (options.bottom) placements.push({ edge: "bottom" });
	return placements;
}

function describe(placement: ItemPlacement): string {
	if ("edge" in placement) return `to the ${placement.edge}`;
	return `${placement.side} ${formatItemId(placement.targetId)}`;
}

function fail(message: string): void {
	console.error(chalk.red(message));
	process.exitCode = 1;
}

export async function moveItem(
	id: string,
	options: MoveItemOptions,
): Promise<void> {
	const placements = toPlacements(options);
	if (placements.length !== 1)
		return fail("Pass exactly one of --before, --after, --top or --bottom.");
	const [placement] = placements;
	const itemId = parseItemId(id);

	const { orm } = await getReady();
	const error = await reorderItem(orm, itemId, placement);
	if (error) return fail(error);

	console.log(
		chalk.green(`Moved ${formatItemId(itemId)} ${describe(placement)}.`),
	);
}
