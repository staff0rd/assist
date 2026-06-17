import { asc, inArray } from "drizzle-orm";
import type { Db } from "../../shared/db/Db";
import {
	type CommentRow,
	comments,
	type LinkRow,
	links,
	type PhaseRow,
	planPhases,
	planTasks,
	type TaskRow,
} from "../../shared/db/schema";

/** Relation rows for a set of items, grouped by item id. */
export type Relations = {
	comments: Map<number, CommentRow[]>;
	links: Map<number, LinkRow[]>;
	phases: Map<number, PhaseRow[]>;
	tasks: Map<number, TaskRow[]>;
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

const selectComments = (orm: Db, ids: number[]) =>
	orm
		.select()
		.from(comments)
		.where(inArray(comments.itemId, ids))
		.orderBy(asc(comments.itemId), asc(comments.idx));

const selectLinks = (orm: Db, ids: number[]) =>
	orm
		.select()
		.from(links)
		.where(inArray(links.itemId, ids))
		.orderBy(asc(links.itemId));

const selectPhases = (orm: Db, ids: number[]) =>
	orm
		.select()
		.from(planPhases)
		.where(inArray(planPhases.itemId, ids))
		.orderBy(asc(planPhases.itemId), asc(planPhases.idx));

const selectTasks = (orm: Db, ids: number[]) =>
	orm
		.select()
		.from(planTasks)
		.where(inArray(planTasks.itemId, ids))
		.orderBy(
			asc(planTasks.itemId),
			asc(planTasks.phaseIdx),
			asc(planTasks.idx),
		);

/**
 * Which relation tables to query. Links and phases are always loaded; comments
 * and tasks are opt-in because the whole-backlog callers (list, next, migrate)
 * never read them — only {@link ./loadItem}, opening a single item, needs them.
 */
type LoadRelationsOptions = {
	includeComments?: boolean;
	includeTasks?: boolean;
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
	{ includeComments = true, includeTasks = true }: LoadRelationsOptions = {},
): Promise<Relations> {
	const [commentRows, linkRows, phaseRows, taskRows] = await Promise.all([
		includeComments ? selectComments(orm, ids) : ([] as CommentRow[]),
		selectLinks(orm, ids),
		selectPhases(orm, ids),
		includeTasks ? selectTasks(orm, ids) : ([] as TaskRow[]),
	]);
	return {
		comments: groupByItem(commentRows),
		links: groupByItem(linkRows),
		phases: groupByItem(phaseRows),
		tasks: groupByItem(taskRows),
	};
}
