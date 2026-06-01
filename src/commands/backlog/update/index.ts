import chalk from "chalk";
import { getBacklogDb } from "../getBacklogDb";
import { loadAndFindItem } from "../shared";
import { buildUpdateSql } from "./buildUpdateSql";

type UpdateOptions = {
	name?: string;
	desc?: string;
	type?: string;
	ac?: string[];
};

export async function update(
	id: string,
	options: UpdateOptions,
): Promise<void> {
	const result = await loadAndFindItem(id);
	if (!result) return;

	const built = buildUpdateSql(options);
	if (!built) return;

	const db = await getBacklogDb();
	const itemId = result.item.id;

	await db.run(`UPDATE items SET ${built.sets.join(", ")} WHERE id = ?`, [
		...built.params,
		itemId,
	]);

	console.log(chalk.green(`Updated ${built.fields} on item #${itemId}.`));
}
