export type ConsoleLevel = "warn" | "error" | "uncaught" | "rejection";

export type CapturedConsoleEntry = {
	time: number;
	level: ConsoleLevel;
	message: string;
	stack?: string;
	url: string;
};

export type ConsoleEntry = CapturedConsoleEntry & { tabId: number };

export type ConsoleQuery = {
	tabId?: number;
	since?: number;
	grep?: string;
	limit: number;
};

export type ConsoleEntriesMessage = {
	type: typeof CONSOLE_ENTRIES_TYPE;
	entries: unknown[];
};

export const CONSOLE_EVENT = "assist-console-entry";

export const CONSOLE_ENTRIES_TYPE = "assist-console-entries";

export const RECORD_CONSOLE_KEY = "recordConsole";

export const CONSOLE_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;

export const CONSOLE_MAX_ENTRIES = 20_000;

export const CONSOLE_MAX_TEXT_LENGTH = 2048;

export const CONSOLE_DEFAULT_LIMIT = 200;
