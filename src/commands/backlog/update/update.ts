import chalk from "chalk";
import { eq } from "drizzle-orm";
import { items } from "../../../shared/db/schema";
import { formatItemId } from "../formatItemId";
import { findOneItem } from "../shared";
import { buildUpdateValues } from "./buildUpdateValues";
import { resolveAcUpdate } from "./resolveAcUpdate";
import { resolveOriginUpdate } from "./resolveOriginUpdate";

type UpdateOptions = {
	name?: string;
	desc?: string;
	type?: string;
	ac?: string[];
	addAc?: string[];
	editAc?: string[];
	removeAc?: string;
	origin?: string | boolean;
};

export async function update(
	id: string,
	options: UpdateOptions,
): Promise<void> {
	const found = await findOneItem(id);
	if (!found) return;

	const acResult = resolveAcUpdate(options, found.item.acceptanceCriteria);
	if (!acResult.ok) return;

	const originResult = resolveOriginUpdate(options.origin, found.item);
	if (originResult.kind === "noop") return;
	const origin = originResult.kind === "set" ? originResult.origin : undefined;

	const built = buildUpdateValues({ ...options, ac: acResult.ac, origin });
	if (!built) return;

	const { orm } = found;
	const itemId = found.item.id;

	await orm.update(items).set(built.set).where(eq(items.id, itemId));

	console.log(
		chalk.green(`Updated ${built.fields} on item ${formatItemId(itemId)}.`),
	);
}
