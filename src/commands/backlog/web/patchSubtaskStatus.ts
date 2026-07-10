import type { IncomingMessage, ServerResponse } from "node:http";
import { respondJson } from "../../../shared/web";
import { formatItemId } from "../formatItemId";
import { loadItem } from "../loadItem";
import type { SubtaskStatus } from "../types";
import { updateSubtaskStatus } from "../updateSubtaskStatus";
import { parseStatusBody } from "./parseStatusBody";
import { findItemOr404 } from "./shared";

const validStatuses: SubtaskStatus[] = ["todo", "in-progress", "done"];

export async function patchSubtaskStatus(
	req: IncomingMessage,
	res: ServerResponse,
	id: number,
	idx: number,
): Promise<void> {
	const { status } = await parseStatusBody(req);
	if (!validStatuses.includes(status as SubtaskStatus)) {
		respondJson(res, 400, {
			error: `Invalid status "${status}". Use one of: ${validStatuses.join(", ")}.`,
		});
		return;
	}
	const result = await findItemOr404(res, id);
	if (!result) return;
	const { orm, item } = result;
	const subtasks = item.subtasks ?? [];
	if (idx < 0 || idx >= subtasks.length) {
		respondJson(res, 400, {
			error: `Item ${formatItemId(id)} has no sub-task ${idx}.`,
		});
		return;
	}
	await updateSubtaskStatus(orm, id, idx, status as SubtaskStatus);
	respondJson(res, 200, await loadItem(orm, id));
}
