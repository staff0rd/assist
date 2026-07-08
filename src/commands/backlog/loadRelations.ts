import type { Db } from "../../shared/db/Db";
import type {
	CommentRow,
	GitRefRow,
	PhaseUsageRow,
	SubtaskRow,
	TaskRow,
} from "../../shared/db/schema";
import { groupByItem } from "./groupByItem";
import type { LoadRelationsOptions, Relations } from "./Relations";
import { relationQueries } from "./relationQueries";

export type { Relations } from "./Relations";

export async function loadRelations(
	orm: Db,
	ids: number[],
	{
		includeComments = true,
		includeTasks = true,
		includeSubtasks = true,
		includeUsage = false,
		includeGitRefs = false,
	}: LoadRelationsOptions = {},
): Promise<Relations> {
	const [
		commentRows,
		linkRows,
		phaseRows,
		taskRows,
		subtaskRows,
		usageRows,
		gitRefRows,
	] = await Promise.all([
		includeComments ? relationQueries.comments(orm, ids) : ([] as CommentRow[]),
		relationQueries.links(orm, ids),
		relationQueries.phases(orm, ids),
		includeTasks ? relationQueries.tasks(orm, ids) : ([] as TaskRow[]),
		includeSubtasks ? relationQueries.subtasks(orm, ids) : ([] as SubtaskRow[]),
		includeUsage ? relationQueries.usage(orm, ids) : ([] as PhaseUsageRow[]),
		includeGitRefs ? relationQueries.gitRefs(orm, ids) : ([] as GitRefRow[]),
	]);
	return {
		comments: groupByItem(commentRows),
		links: groupByItem(linkRows),
		phases: groupByItem(phaseRows),
		tasks: groupByItem(taskRows),
		subtasks: groupByItem(subtaskRows),
		usage: groupByItem(usageRows),
		gitRefs: groupByItem(gitRefRows),
	};
}
