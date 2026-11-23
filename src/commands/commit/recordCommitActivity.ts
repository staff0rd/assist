import { formatItemId } from "../backlog/formatItemId";
import { recordSessionRefs } from "../../shared/db/recordSessionRefs";
import { resolveSessionItemId } from "../../shared/resolveSessionItemId";
import { collectCommitRefs } from "./collectCommitRefs";

export async function recordCommitActivity(message: string): Promise<void> {
	if (resolveSessionItemId() === null) return;
	const result = await recordSessionRefs(collectCommitRefs(message));
	if (result.status !== "failed") return;
	const reason =
		result.error instanceof Error ? result.error.message : String(result.error);
	console.error(
		`Warning: the commit was not recorded on item ${formatItemId(result.itemId)}: ${reason}`,
	);
}
