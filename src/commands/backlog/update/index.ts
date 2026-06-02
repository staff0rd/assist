import chalk from "chalk";
import { getBacklogDb } from "../getBacklogDb";
import { loadAndFindItem } from "../shared";
import { applyAcMutations, hasAcMutations } from "./applyAcMutations";
import { buildUpdateSql } from "./buildUpdateSql";

type UpdateOptions = {
	name?: string;
	desc?: string;
	type?: string;
	ac?: string[];
	addAc?: string[];
	editAc?: string[];
	removeAc?: string;
};

export async function update(
	id: string,
	options: UpdateOptions,
): Promise<void> {
	const result = await loadAndFindItem(id);
	if (!result) return;

	let ac = options.ac;
	if (hasAcMutations(options)) {
		if (options.ac) {
			console.log(
				chalk.red("Cannot combine --ac with --add-ac/--edit-ac/--remove-ac."),
			);
			process.exitCode = 1;
			return;
		}
		const mutation = applyAcMutations(result.item.acceptanceCriteria, options);
		if (!mutation.ok) {
			console.log(chalk.red(mutation.error));
			process.exitCode = 1;
			return;
		}
		ac = mutation.criteria;
	}

	const built = buildUpdateSql({ ...options, ac });
	if (!built) return;

	const db = await getBacklogDb();
	const itemId = result.item.id;

	await db.run(`UPDATE items SET ${built.sets.join(", ")} WHERE id = ?`, [
		...built.params,
		itemId,
	]);

	console.log(chalk.green(`Updated ${built.fields} on item #${itemId}.`));
}
