import type { Db } from "../../shared/db/Db";
import { handovers } from "../../shared/db/schema";

type SaveHandoverInput = {
	origin: string;
	summary: string;
	content: string;
	/** Override the created timestamp (used when migrating disk handovers). */
	createdAt?: Date;
};

/** Insert a handover note for `origin` as a new row in the backlog DB. */
export async function saveHandover(
	orm: Db,
	input: SaveHandoverInput,
): Promise<void> {
	await orm.insert(handovers).values({
		origin: input.origin,
		summary: input.summary,
		content: input.content,
		...(input.createdAt ? { createdAt: input.createdAt } : {}),
	});
}
