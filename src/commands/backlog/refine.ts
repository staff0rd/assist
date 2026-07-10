import chalk from "chalk";
import enquirer from "enquirer";
import { exitOnCancel } from "../../shared/exitOnCancel";
import { formatItemId, parseItemId } from "./formatItemId";
import { type LaunchModeOptions, launchMode } from "./launchMode";
import { typeLabel } from "./list/shared";
import { loadBacklogSummaries } from "./loadBacklogSummaries";
import { loadItem } from "./loadItem";
import { getReady } from "./shared";

async function pickItemForRefine(): Promise<string | undefined> {
	const items = await loadBacklogSummaries();
	const active = items.filter(
		(i) => i.status === "todo" || i.status === "in-progress",
	);

	if (active.length === 0) {
		console.log(chalk.yellow("No active backlog items to refine."));
		return undefined;
	}

	if (active.length === 1) {
		const item = active[0];
		console.log(
			chalk.bold(`Auto-selecting item ${formatItemId(item.id)}: ${item.name}`),
		);
		return formatItemId(item.id);
	}

	const { selected } = await exitOnCancel(
		enquirer.prompt<{ selected: string }>({
			type: "select",
			name: "selected",
			message: "Choose a backlog item to refine:",
			choices: active.map((item) => ({
				name: `${typeLabel(item.type)} ${formatItemId(item.id)}: ${item.name}`,
			})),
		}),
	);

	return selected.match(/(a\d+):/)?.[1] ?? "";
}

export async function refine(
	id?: string,
	options?: LaunchModeOptions,
): Promise<void> {
	const itemId = id ?? (await pickItemForRefine());
	if (!itemId) return;

	const numericId = parseItemId(itemId);
	const item = await loadItem((await getReady()).orm, numericId);

	await launchMode(`refine ${itemId}`, {
		...options,
		itemId: item ? numericId : undefined,
		itemName: item?.name,
	});
}
