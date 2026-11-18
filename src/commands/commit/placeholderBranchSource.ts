import { closeDb, getDb } from "../../shared/db/getDb";
import { resolveSessionItemId } from "../../shared/resolveSessionItemId";
import { loadItem } from "../backlog/loadItem";

export async function placeholderBranchSource(
	message: string,
): Promise<{ text: string; jira?: string }> {
	const itemId = resolveSessionItemId();
	if (itemId === null) return { text: message };
	try {
		const item = await loadItem(await getDb(), itemId);
		if (!item) return { text: message };
		return { text: item.name, jira: item.jiraKey };
	} catch {
		return { text: message };
	} finally {
		await closeDb().catch(() => {});
	}
}
