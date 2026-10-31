import { serializeConsoleArgs } from "./serializeConsoleArgs";
import { truncateConsoleText } from "./truncateConsoleText";
import { CONSOLE_EVENT, type ConsoleLevel } from "./types";

function stackOf(value: unknown): string | undefined {
	return value instanceof Error ? value.stack : undefined;
}

function emit(level: ConsoleLevel, message: string, stack?: string): void {
	const entry = {
		time: Date.now(),
		level,
		message,
		url: location.href,
		...(stack ? { stack: truncateConsoleText(stack) } : {}),
	};
	document.dispatchEvent(
		new CustomEvent(CONSOLE_EVENT, { detail: JSON.stringify(entry) }),
	);
}

function wrap(level: "warn" | "error"): void {
	const original = console[level];
	console[level] = function assistConsole(this: Console, ...args: unknown[]) {
		try {
			emit(level, serializeConsoleArgs(args), args.map(stackOf).find(Boolean));
		} catch {}
		return original.apply(this, args);
	};
}

export function captureConsole(): void {
	wrap("warn");
	wrap("error");
	globalThis.addEventListener("error", (event) =>
		emit(
			"uncaught",
			serializeConsoleArgs([event.message || event.error]),
			stackOf(event.error),
		),
	);
	globalThis.addEventListener("unhandledrejection", (event) =>
		emit(
			"rejection",
			serializeConsoleArgs([event.reason]),
			stackOf(event.reason),
		),
	);
}
