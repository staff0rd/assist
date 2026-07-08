import { asc, inArray } from "drizzle-orm";
import type { Db } from "../../shared/db/Db";
import {
	comments,
	itemGitRefs,
	itemSubtasks,
	links,
	phaseUsage,
	planPhases,
	planTasks,
} from "../../shared/db/schema";

/**
 * Batched relation queries, one per relation table. Each is scoped to a set of
 * item ids and ordered so the grouped result is stable. See {@link ./loadRelations}.
 */
export const relationQueries = {
	comments: (orm: Db, ids: number[]) =>
		orm
			.select()
			.from(comments)
			.where(inArray(comments.itemId, ids))
			.orderBy(asc(comments.itemId), asc(comments.idx)),

	links: (orm: Db, ids: number[]) =>
		orm
			.select()
			.from(links)
			.where(inArray(links.itemId, ids))
			.orderBy(asc(links.itemId)),

	phases: (orm: Db, ids: number[]) =>
		orm
			.select()
			.from(planPhases)
			.where(inArray(planPhases.itemId, ids))
			.orderBy(asc(planPhases.itemId), asc(planPhases.idx)),

	tasks: (orm: Db, ids: number[]) =>
		orm
			.select()
			.from(planTasks)
			.where(inArray(planTasks.itemId, ids))
			.orderBy(
				asc(planTasks.itemId),
				asc(planTasks.phaseIdx),
				asc(planTasks.idx),
			),

	subtasks: (orm: Db, ids: number[]) =>
		orm
			.select()
			.from(itemSubtasks)
			.where(inArray(itemSubtasks.itemId, ids))
			.orderBy(asc(itemSubtasks.itemId), asc(itemSubtasks.idx)),

	usage: (orm: Db, ids: number[]) =>
		orm
			.select()
			.from(phaseUsage)
			.where(inArray(phaseUsage.itemId, ids))
			.orderBy(asc(phaseUsage.itemId), asc(phaseUsage.phaseIdx)),

	gitRefs: (orm: Db, ids: number[]) =>
		orm
			.select()
			.from(itemGitRefs)
			.where(inArray(itemGitRefs.itemId, ids))
			.orderBy(asc(itemGitRefs.itemId), asc(itemGitRefs.createdAt)),
};
