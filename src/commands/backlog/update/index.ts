import chalk from "chalk";
import { commitBacklog } from "../commitBacklog";
import { exportToJsonl } from "../exportToJsonl";
import { openDb } from "../openDb";
import { getBacklogDir, loadAndFindItem } from "../shared";
import { buildUpdateSql } from "./buildUpdateSql";

type UpdateOptions = {
	name?: string;
	desc?: string;
	type?: string;
	ac?: string[];
};

export function update(id: string, options: UpdateOptions): void {
	const result = loadAndFindItem(id);
	if (!result) return;

	const built = buildUpdateSql(options);
	if (!built) return;

	const dir = getBacklogDir();
	const db = openDb(dir);
	const itemId = result.item.id;

	db.prepare(`UPDATE items SET ${built.sets.join(", ")} WHERE id = ?`).run(
		...built.params,
		itemId,
	);

	exportToJsonl(db, dir);
	commitBacklog(itemId, options.name ?? result.item.name);
	console.log(chalk.green(`Updated ${built.fields} on item #${itemId}.`));
}
