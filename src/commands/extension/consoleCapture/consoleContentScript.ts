import { extensionRuntime } from "../sendToAssist/extensionRuntime";
import { toCapturedEntry } from "./toCapturedEntry";
import {
	type CapturedConsoleEntry,
	CONSOLE_ENTRIES_TYPE,
	CONSOLE_EVENT,
	type ConsoleEntriesMessage,
} from "./types";
import { watchRecordConsole } from "./watchRecordConsole";

const FLUSH_MS = 1_000;
const MAX_PENDING = 500;

function parseDetail(detail: unknown): CapturedConsoleEntry | undefined {
	if (typeof detail !== "string") return undefined;
	try {
		return toCapturedEntry(JSON.parse(detail));
	} catch {
		return undefined;
	}
}

export function consoleContentScript(): void {
	let recording: boolean | undefined;
	let pending: CapturedConsoleEntry[] = [];
	let timer: ReturnType<typeof setTimeout> | undefined;

	const flush = () => {
		clearTimeout(timer);
		timer = undefined;
		if (!recording || pending.length === 0) return;
		const message: ConsoleEntriesMessage = {
			type: CONSOLE_ENTRIES_TYPE,
			entries: pending,
		};
		pending = [];
		void extensionRuntime()
			?.sendMessage(message)
			.catch(() => undefined);
	};

	document.addEventListener(CONSOLE_EVENT, (event) => {
		if (recording === false) return;
		const entry = parseDetail((event as CustomEvent).detail);
		if (!entry || pending.length >= MAX_PENDING) return;
		pending.push(entry);
		if (recording) timer ??= setTimeout(flush, FLUSH_MS);
	});
	addEventListener("pagehide", flush);
	watchRecordConsole((on) => {
		recording = on;
		if (on) flush();
		else pending = [];
	});
}

consoleContentScript();
