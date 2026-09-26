const NOTIFICATION = /<task-notification>([\s\S]*?)<\/task-notification>/g;
const TASK_ID = /<task-id>([^<]+)<\/task-id>/;
const STATUS = /<status>([^<]+)<\/status>/;
const KILLED_STATUSES = new Set(["killed", "stopped"]);
const STOP_TOOLS = new Set(["KillShell", "KillBash", "TaskStop"]);

export function unfinishedBackgroundTasks(
	entries: Record<string, unknown>[],
): string[] {
	const inFlight = new Set<string>();
	for (const entry of entries) {
		const started = startedTaskId(entry);
		if (started) inFlight.add(started);
		for (const finished of selfFinishedTaskIds(entry))
			inFlight.delete(finished);
		for (const stopped of deliberatelyStoppedTaskIds(entry))
			inFlight.delete(stopped);
	}
	return [...inFlight];
}

function startedTaskId(entry: Record<string, unknown>): string | undefined {
	const result = asRecord(entry.toolUseResult);
	return typeof result?.backgroundTaskId === "string"
		? result.backgroundTaskId
		: undefined;
}

function selfFinishedTaskIds(entry: Record<string, unknown>): string[] {
	const text = taskNotificationText(entry);
	if (!text) return [];
	const ids: string[] = [];
	for (const [, body] of text.matchAll(NOTIFICATION)) {
		const id = body.match(TASK_ID)?.[1];
		const status = body.match(STATUS)?.[1]?.trim();
		if (id && !(status && KILLED_STATUSES.has(status))) ids.push(id);
	}
	return ids;
}

function deliberatelyStoppedTaskIds(entry: Record<string, unknown>): string[] {
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
