import type { SubtaskRow } from "../../shared/db/schema";
import type { Relations } from "./loadRelations";
import type { BacklogItem, Subtask } from "./types";

function rowToSubtask(s: SubtaskRow): Subtask {
	const subtask: Subtask = {
		title: s.title,
		status: s.status as Subtask["status"],
	};
	if (s.description != null) subtask.description = s.description;
	return subtask;
}

export function attachSubtasks(
	item: BacklogItem,
	rel: Relations,
	id: number,
): void {
	const subtasks = (rel.subtasks.get(id) ?? []).map(rowToSubtask);
	if (subtasks.length > 0) item.subtasks = subtasks;
}
