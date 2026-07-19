import type { CommentRow, ItemRow, LinkRow } from "../../shared/db/schema";
import { attachGitRefs } from "./attachGitRefs";
import { attachSessions } from "./attachSessions";
import { attachSubtasks } from "./attachSubtasks";
import { attachUsage } from "./attachUsage";
import { buildPlan } from "./buildPlan";
import type { Relations } from "./loadRelations";
import type { BacklogComment, BacklogItem, BacklogStatus } from "./types";

type Link = NonNullable<BacklogItem["links"]>[number];

function rowToComment(c: CommentRow): BacklogComment {
	const comment: BacklogComment = {
		id: c.id,
		text: c.text,
		timestamp: c.timestamp,
		type: c.type as BacklogComment["type"],
	};
	if (c.phase != null) comment.phase = c.phase;
	return comment;
}

function rowToLink(l: LinkRow): Link {
	return { type: l.type as Link["type"], targetId: l.targetId };
}

function assignOptionalColumns(item: BacklogItem, row: ItemRow): void {
	if (row.description != null) item.description = row.description;
	if (row.currentPhase != null) item.currentPhase = row.currentPhase;
	if (row.jiraKey != null) item.jiraKey = row.jiraKey;
}

/** The item's own columns, before relations are attached. */
function baseItem(row: ItemRow): BacklogItem {
	const item: BacklogItem = {
		id: row.id,
		type: row.type as BacklogItem["type"],
		name: row.name,
		acceptanceCriteria: JSON.parse(row.acceptanceCriteria),
		status: row.status as BacklogStatus,
		starred: row.starred,
		origin: row.origin,
	};
	assignOptionalColumns(item, row);
	return item;
}

function attachComments(item: BacklogItem, rel: Relations, id: number): void {
	const comments = (rel.comments.get(id) ?? []).map(rowToComment);
	if (comments.length > 0) item.comments = comments;
}

function attachLinks(item: BacklogItem, rel: Relations, id: number): void {
	const links = (rel.links.get(id) ?? []).map(rowToLink);
	if (links.length > 0) item.links = links;
}

function attachPlan(item: BacklogItem, rel: Relations, id: number): void {
	const phases = rel.phases.get(id) ?? [];
	if (phases.length > 0) item.plan = buildPlan(phases, rel.tasks.get(id) ?? []);
}

/** Assemble a domain item from its row and the pre-grouped relation rows. */
export function rowToItem(row: ItemRow, rel: Relations): BacklogItem {
	const item = baseItem(row);
	attachComments(item, rel, row.id);
	attachSubtasks(item, rel, row.id);
	attachLinks(item, rel, row.id);
	attachPlan(item, rel, row.id);
	attachUsage(item, rel, row.id);
	attachSessions(item, rel, row.id);
	attachGitRefs(item, rel, row.id);
	return item;
}
