import { asRecord } from "./asRecord";
import { deliberatelyStoppedTaskIds } from "./deliberatelyStoppedTaskIds";
import { notifiedTasks } from "./notifiedTasks";

const KILLED_STATUSES = new Set(["killed", "stopped"]);

export function unfinishedBackgroundTasks(
	entries: Record<string, unknown>[],
): string[] {
	const inFlight = new Set<string>();
	const killedAwaitingTurn = new Set<string>();
	for (const entry of entries) {
		const started = startedTaskId(entry);
		if (started) inFlight.add(started);
		for (const finished of selfFinishedTaskIds(entry))
			inFlight.delete(finished);
		for (const killed of killedTaskIds(entry)) killedAwaitingTurn.add(killed);
		for (const stopped of deliberatelyStoppedTaskIds(entry))
			inFlight.delete(stopped);
		if (entry.type === "assistant") {
			for (const handled of killedAwaitingTurn) inFlight.delete(handled);
			killedAwaitingTurn.clear();
		}
	}
	return [...inFlight];
}

function killedTaskIds(entry: Record<string, unknown>): string[] {
	return notifiedTasks(entry)
		.filter(({ status }) => status && KILLED_STATUSES.has(status))
		.map(({ id }) => id);
}

function startedTaskId(entry: Record<string, unknown>): string | undefined {
	const result = asRecord(entry.toolUseResult);
	return typeof result?.backgroundTaskId === "string"
		? result.backgroundTaskId
		: undefined;
}

function selfFinishedTaskIds(entry: Record<string, unknown>): string[] {
	return notifiedTasks(entry)
		.filter(({ status }) => !(status && KILLED_STATUSES.has(status)))
		.map(({ id }) => id);
}
