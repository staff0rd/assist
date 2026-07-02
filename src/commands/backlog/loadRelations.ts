import type { Db } from "../../shared/db/Db";
import type {
	CommentRow,
	LinkRow,
	PhaseRow,
	PhaseUsageRow,
	TaskRow,
} from "../../shared/db/schema";
import { relationQueries } from "./relationQueries";

/** Relation rows for a set of items, grouped by item id. */
export type Relations = {
	comments: Map<number, CommentRow[]>;
	links: Map<number, LinkRow[]>;
	phases: Map<number, PhaseRow[]>;
	tasks: Map<number, TaskRow[]>;
	usage: Map<number, PhaseUsageRow[]>;
};

/** Group rows by their `itemId`, preserving the order rows arrive in. */
function groupByItem<T extends { itemId: number }>(
	rows: T[],
): Map<number, T[]> {
	const map = new Map<number, T[]>();
	for (const row of rows) {
		const bucket = map.get(row.itemId);
		if (bucket) bucket.push(row);
		else map.set(row.itemId, [row]);
	}
	return map;
}

/**
 * Which relation tables to query. Links and phases are always loaded; comments,
 * tasks and per-phase usage are opt-in because the whole-backlog callers (list,
 * next, migrate) never read them — only {@link ./loadItem}, opening a single
 * item, needs them.
 */
type LoadRelationsOptions = {
	includeComments?: boolean;
	includeTasks?: boolean;
	includeUsage?: boolean;
};

/**
 * Fetch relation rows for the given item ids in one batched query each
 * (run in parallel), grouped by item id. A fixed handful of round-trips
 * regardless of item count — this is what keeps the load fast against
 * high-latency (remote) Postgres.
 */
export async function loadRelations(
	orm: Db,
	ids: number[],
	{
		includeComments = true,
		includeTasks = true,
		includeUsage = false,
	}: LoadRelationsOptions = {},
): Promise<Relations> {
	const [commentRows, linkRows, phaseRows, taskRows, usageRows] =
		await Promise.all([
			includeComments
				? relationQueries.comments(orm, ids)
				: ([] as CommentRow[]),
			relationQueries.links(orm, ids),
			relationQueries.phases(orm, ids),
			includeTasks ? relationQueries.tasks(orm, ids) : ([] as TaskRow[]),
			includeUsage ? relationQueries.usage(orm, ids) : ([] as PhaseUsageRow[]),
		]);
	return {
		comments: groupByItem(commentRows),
		links: groupByItem(linkRows),
		phases: groupByItem(phaseRows),
		tasks: groupByItem(taskRows),
		usage: groupByItem(usageRows),
	};
}
