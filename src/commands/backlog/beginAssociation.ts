import chalk from "chalk";
import { eq } from "drizzle-orm";
import type { Db } from "../../shared/db/Db";
import { items } from "../../shared/db/schema";
import { formatItemId } from "./formatItemId";
import { findOneItem } from "./shared";

type AssociationTarget = { orm: Db; itemId: number };

export async function beginAssociation(
	id: string,
	options: { clear?: boolean },
	clearPatch: Partial<typeof items.$inferInsert>,
	label: string,
): Promise<AssociationTarget | null> {
	const found = await findOneItem(id);
	if (!found) {
		process.exitCode = 1;
		return null;
	}

	const { orm } = found;
	const itemId = found.item.id;

	if (options.clear) {
		await orm.update(items).set(clearPatch).where(eq(items.id, itemId));
		console.log(
			chalk.green(
				`Cleared ${label} association on item ${formatItemId(itemId)}.`,
			),
		);
		return null;
	}

	return { orm, itemId };
}
