import { asc, inArray } from "drizzle-orm";
import type { BacklogOrm } from "./BacklogOrm";
import {
	type CommentRow,
	comments,
	type LinkRow,
	links,
	type PhaseRow,
	planPhases,
	planTasks,
	type TaskRow,
} from "./backlogSchema";

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

const selectComments = (orm: BacklogOrm, ids: number[]) =>
	orm
		.select()
		.from(comments)
		.where(inArray(comments.itemId, ids))
		.orderBy(asc(comments.itemId), asc(comments.idx));

const selectLinks = (orm: BacklogOrm, ids: number[]) =>
	orm
		.select()
		.from(links)
		.where(inArray(links.itemId, ids))
		.orderBy(asc(links.itemId));

const selectPhases = (orm: BacklogOrm, ids: number[]) =>
	orm
		.select()
		.from(planPhases)
		.where(inArray(planPhases.itemId, ids))
		.orderBy(asc(planPhases.itemId), asc(planPhases.idx));

const selectTasks = (orm: BacklogOrm, ids: number[]) =>
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
 * Fetch every relation row for the given item ids in one batched query each
 * (run in parallel), grouped by item id. A fixed handful of round-trips
 * regardless of item count — this is what keeps the load fast against
 * high-latency (remote) Postgres.
 */
export async function loadRelations(
	orm: BacklogOrm,
	ids: number[],
): Promise<Relations> {
	const [commentRows, linkRows, phaseRows, taskRows] = await Promise.all([
		selectComments(orm, ids),
		selectLinks(orm, ids),
		selectPhases(orm, ids),
		selectTasks(orm, ids),
	]);
	return {
		comments: groupByItem(commentRows),
		links: groupByItem(linkRows),
		phases: groupByItem(phaseRows),
		tasks: groupByItem(taskRows),
	};
}
