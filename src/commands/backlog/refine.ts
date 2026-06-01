import chalk from "chalk";
import enquirer from "enquirer";
import { exitOnCancel } from "../../shared/exitOnCancel";
import { launchMode } from "./launchMode";
import { typeLabel } from "./list/shared";
import { loadBacklog } from "./shared";

async function pickItemForRefine(): Promise<string | undefined> {
	const items = await loadBacklog();
	const active = items.filter(
		(i) => i.status === "todo" || i.status === "in-progress",
	);

	if (active.length === 0) {
		console.log(chalk.yellow("No active backlog items to refine."));
		return undefined;
	}

	if (active.length === 1) {
		const item = active[0];
		console.log(chalk.bold(`Auto-selecting item #${item.id}: ${item.name}`));
		return String(item.id);
	}

	const { selected } = await exitOnCancel(
		enquirer.prompt<{ selected: string }>({
			type: "select",
			name: "selected",
			message: "Choose a backlog item to refine:",
			choices: active.map((item) => ({
				name: `${typeLabel(item.type)} #${item.id}: ${item.name}`,
			})),
		}),
	);

	return selected.match(/#(\d+)/)?.[1] ?? "";
}

export async function refine(id?: string): Promise<void> {
	const itemId = id ?? (await pickItemForRefine());
	if (!itemId) return;

	await launchMode(`refine ${itemId}`);
}
