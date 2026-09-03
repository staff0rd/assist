const TASK_ID = /<task-id>([^<]+)<\/task-id>/g;

export function unfinishedBackgroundTasks(
	entries: Record<string, unknown>[],
): string[] {
	const inFlight = new Set<string>();
	for (const entry of entries) {
		const started = startedTaskId(entry);
		if (started) inFlight.add(started);
		for (const notified of notifiedTaskIds(entry)) inFlight.delete(notified);
	}
	return [...inFlight];
}

function startedTaskId(entry: Record<string, unknown>): string | undefined {
	const result = asRecord(entry.toolUseResult);
	return typeof result?.backgroundTaskId === "string"
		? result.backgroundTaskId
		: undefined;
}

function notifiedTaskIds(entry: Record<string, unknown>): string[] {
	const text = taskNotificationText(entry);
	if (!text) return [];
	return [...text.matchAll(TASK_ID)].map((match) => match[1]);
}

function taskNotificationText(
	entry: Record<string, unknown>,
): string | undefined {
	const content = asRecord(entry.message)?.content ?? entry.content;
	return typeof content === "string" && content.includes("<task-notification>")
		? content
		: undefined;
}

function asRecord(value: unknown): Record<string, unknown> | null {
	return value && typeof value === "object"
		? (value as Record<string, unknown>)
		: null;
}
