import { truncateConsoleText } from "./truncateConsoleText";
import type { CapturedConsoleEntry, ConsoleLevel } from "./types";

const LEVELS: ReadonlySet<unknown> = new Set<ConsoleLevel>([
	"warn",
	"error",
	"uncaught",
	"rejection",
]);

export function toCapturedEntry(
	value: unknown,
): CapturedConsoleEntry | undefined {
	const { time, level, message, stack, url } = (value ?? {}) as Record<
		string,
		unknown
	>;
	if (
		typeof time !== "number" ||
		!LEVELS.has(level) ||
		typeof message !== "string" ||
		typeof url !== "string"
	)
		return undefined;
	return {
		time,
		level: level as ConsoleLevel,
		message: truncateConsoleText(message),
		url: truncateConsoleText(url),
		...(typeof stack === "string" && stack
			? { stack: truncateConsoleText(stack) }
			: {}),
	};
}
