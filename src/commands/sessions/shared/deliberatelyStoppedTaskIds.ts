import { asRecord } from "./asRecord";

const STOP_TOOLS = new Set(["KillShell", "KillBash", "TaskStop"]);

export function deliberatelyStoppedTaskIds(
	entry: Record<string, unknown>,
): string[] {
	if (entry.type !== "assistant") return [];
	const content = asRecord(entry.message)?.content;
	if (!Array.isArray(content)) return [];
	const ids: string[] = [];
	for (const block of content) {
		const b = asRecord(block);
		if (b?.type !== "tool_use" || !STOP_TOOLS.has(String(b.name))) continue;
		const input = asRecord(b.input);
		const id = input?.task_id ?? input?.shell_id ?? input?.bash_id;
		if (typeof id === "string") ids.push(id);
	}
	return ids;
}
