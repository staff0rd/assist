import type { items } from "../../shared/db/schema";
import type { BacklogItem } from "./types";

/**
 * Build the `items` column values shared by inserts and upserts from a backlog
 * item and its owning `origin`. The auto-assigned `id` is intentionally omitted;
 * callers that need to set an explicit id spread it in alongside.
 */
export function itemColumns(
	item: Omit<BacklogItem, "id">,
	origin: string,
): Omit<typeof items.$inferInsert, "id"> {
	return {
		origin,
		type: item.type,
		name: item.name,
		description: item.description ?? null,
		acceptanceCriteria: JSON.stringify(item.acceptanceCriteria),
		status: item.status,
		currentPhase: item.currentPhase ?? null,
		starred: item.starred,
	};
}
