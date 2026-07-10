import chalk from "chalk";
import type { Db } from "../../shared/db/Db";
import { links } from "../../shared/db/schema";
import { formatItemId, parseItemId } from "./formatItemId";
import { hasCycle } from "./hasCycle";
import { loadDependencyGraph } from "./loadDependencyGraph";
import { loadItem } from "./loadItem";
import { getReady } from "./shared";
import type { BacklogLinkType } from "./types";
import { validateLinkTarget } from "./validateLinkTarget";

/** Log a red error and return `undefined`, the "invalid" sentinel for the helpers below. */
function fail(message: string): undefined {
	console.log(chalk.red(message));
	return undefined;
}

function parseLinkType(type: string | undefined): BacklogLinkType | undefined {
	const linkType = (type ?? "relates-to") as BacklogLinkType;
	if (linkType === "relates-to" || linkType === "depends-on") return linkType;
	return fail(`Invalid link type: ${linkType}`);
}

/** Whether adding the (depends-on) edge would close a dependency cycle, logging if so. */
async function createsCycle(
	orm: Db,
	linkType: BacklogLinkType,
	fromNum: number,
	toNum: number,
): Promise<boolean> {
	if (linkType !== "depends-on") return false;
	const graph = await loadDependencyGraph(orm);
	if (!hasCycle(graph, fromNum, toNum)) return false;
	fail(
		`Cannot add dependency: ${formatItemId(fromNum)} → ${formatItemId(toNum)} would create a cycle.`,
	);
	return true;
}

export async function link(
	fromId: string,
	toId: string,
	opts: { type?: string },
): Promise<void> {
	const linkType = parseLinkType(opts.type);
	if (!linkType) return;

	const fromNum = parseItemId(fromId);
	const toNum = parseItemId(toId);
	if (fromNum === toNum) return void fail("Cannot link an item to itself.");
	const from = formatItemId(fromNum);
	const to = formatItemId(toNum);

	const { orm } = await getReady();
	const fromItem = await loadItem(orm, fromNum);
	if (!fromItem) return void fail(`Item ${from} not found.`);
	const toItem = await loadItem(orm, toNum);
	if (!toItem) return void fail(`Item ${to} not found.`);

	if (!validateLinkTarget(fromItem, fromNum, toNum, linkType)) return;
	if (await createsCycle(orm, linkType, fromNum, toNum)) return;

	await orm
		.insert(links)
		.values({ itemId: fromNum, type: linkType, targetId: toNum });
	console.log(chalk.green(`Linked ${from} ${linkType} ${to} (${toItem.name})`));
}
