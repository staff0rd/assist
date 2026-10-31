import { browserApi } from "../browserLink/browserApi";
import { BROWSER_LINK_ALARM } from "../browserLink/types";
import { extensionRuntime } from "../sendToAssist/extensionRuntime";
import { addConsoleEntries } from "./addConsoleEntries";
import { isRecordingConsole } from "./isRecordingConsole";
import { pruneConsoleEntries } from "./pruneConsoleEntries";
import { toCapturedEntry } from "./toCapturedEntry";
import {
	CONSOLE_ENTRIES_TYPE,
	type ConsoleEntriesMessage,
	type ConsoleEntry,
} from "./types";

function isConsoleEntriesMessage(
	message: unknown,
): message is ConsoleEntriesMessage {
	const { type, entries } = (message ?? {}) as Record<string, unknown>;
	return type === CONSOLE_ENTRIES_TYPE && Array.isArray(entries);
}

async function store(entries: unknown[], tabId: number): Promise<void> {
	if (!(await isRecordingConsole())) return;
	const stored = entries.flatMap((value): ConsoleEntry[] => {
		const entry = toCapturedEntry(value);
		return entry ? [{ ...entry, tabId }] : [];
	});
	if (stored.length) await addConsoleEntries(stored, Date.now());
}

export function storeConsoleEntries(): void {
	extensionRuntime()?.onMessage.addListener((message, sender) => {
		const tabId = sender?.tab?.id;
		if (!isConsoleEntriesMessage(message) || tabId === undefined)
			return undefined;
		void store(message.entries, tabId).catch(() => undefined);
		return undefined;
	});
	browserApi()?.alarms?.onAlarm.addListener((alarm) => {
		if (alarm.name === BROWSER_LINK_ALARM)
			void pruneConsoleEntries(Date.now()).catch(() => undefined);
	});
}
