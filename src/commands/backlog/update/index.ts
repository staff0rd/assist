import chalk from "chalk";
import { eq } from "drizzle-orm";
import { items } from "../../../shared/db/schema";
import { formatItemId } from "../formatItemId";
import { findOneItem } from "../shared";
import { applyAcMutations, hasAcMutations } from "./applyAcMutations";
import { buildUpdateValues } from "./buildUpdateValues";

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
	const found = await findOneItem(id);
	if (!found) return;

	let ac = options.ac;
	if (hasAcMutations(options)) {
		if (options.ac) {
			console.log(
				chalk.red("Cannot combine --ac with --add-ac/--edit-ac/--remove-ac."),
			);
			process.exitCode = 1;
			return;
		}
		const mutation = applyAcMutations(found.item.acceptanceCriteria, options);
		if (!mutation.ok) {
			console.log(chalk.red(mutation.error));
			process.exitCode = 1;
			return;
		}
		ac = mutation.criteria;
	}

	const built = buildUpdateValues({ ...options, ac });
	if (!built) return;

	const { orm } = found;
	const itemId = found.item.id;

	await orm.update(items).set(built.set).where(eq(items.id, itemId));

	console.log(
		chalk.green(`Updated ${built.fields} on item ${formatItemId(itemId)}.`),
	);
}
