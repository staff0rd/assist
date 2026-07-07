import type { Db } from "../../shared/db/Db";
import type {
	CommentRow,
	LinkRow,
	PhaseRow,
	PhaseUsageRow,
	SubtaskRow,
	TaskRow,
} from "../../shared/db/schema";
import { relationQueries } from "./relationQueries";
import { groupByItem } from "./groupByItem";

/** Relation rows for a set of items, grouped by item id. */
export type Relations = {
	comments: Map<number, CommentRow[]>;
	links: Map<number, LinkRow[]>;
	phases: Map<number, PhaseRow[]>;
	tasks: Map<number, TaskRow[]>;
	subtasks: Map<number, SubtaskRow[]>;
	usage: Map<number, PhaseUsageRow[]>;
};
/**
 * Which relation tables to query. Links and phases are always loaded; comments,
 * tasks, subtasks and per-phase usage are opt-in because the whole-backlog callers
 * (list, next, migrate) never read them — only {@link ./loadItem}, opening a single
 * item, needs them.
 */
type LoadRelationsOptions = {
	includeComments?: boolean;
	includeTasks?: boolean;
	includeSubtasks?: boolean;
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
		includeSubtasks = true,
		includeUsage = false,
	}: LoadRelationsOptions = {},
): Promise<Relations> {
	const [commentRows, linkRows, phaseRows, taskRows, subtaskRows, usageRows] =
		await Promise.all([
			includeComments
				? relationQueries.comments(orm, ids)
				: ([] as CommentRow[]),
			relationQueries.links(orm, ids),
			relationQueries.phases(orm, ids),
			includeTasks ? relationQueries.tasks(orm, ids) : ([] as TaskRow[]),
			includeSubtasks
				? relationQueries.subtasks(orm, ids)
				: ([] as SubtaskRow[]),
			includeUsage ? relationQueries.usage(orm, ids) : ([] as PhaseUsageRow[]),
		]);
	return {
		comments: groupByItem(commentRows),
		links: groupByItem(linkRows),
		phases: groupByItem(phaseRows),
		tasks: groupByItem(taskRows),
		subtasks: groupByItem(subtaskRows),
		usage: groupByItem(usageRows),
	};
}
