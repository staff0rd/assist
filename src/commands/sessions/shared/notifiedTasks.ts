import { asRecord } from "./asRecord";

const NOTIFICATION = /<task-notification>([\s\S]*?)<\/task-notification>/g;
const TASK_ID = /<task-id>([^<]+)<\/task-id>/;
const STATUS = /<status>([^<]+)<\/status>/;

export function notifiedTasks(
	entry: Record<string, unknown>,
): { id: string; status?: string }[] {
	const text = taskNotificationText(entry);
	if (!text) return [];
	const tasks: { id: string; status?: string }[] = [];
	for (const [, body] of text.matchAll(NOTIFICATION)) {
		const id = body.match(TASK_ID)?.[1];
		if (id) tasks.push({ id, status: body.match(STATUS)?.[1]?.trim() });
	}
	return tasks;
}

function taskNotificationText(
	entry: Record<string, unknown>,
): string | undefined {
	const content = asRecord(entry.message)?.content ?? entry.content;
	return typeof content === "string" && content.includes("<task-notification>")
		? content
		: undefined;
}
