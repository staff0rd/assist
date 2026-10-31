import type { ConsoleResult } from "../extension/browserLink/types";

const pad = (value: number, width = 2) => String(value).padStart(width, "0");

function formatTime(time: number): string {
	const date = new Date(time);
	return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}.${pad(date.getMilliseconds(), 3)}`;
}

const indent = (text: string, prefix: string) =>
	text.split("\n").map((line) => `${prefix}${line}`);

export function formatConsoleEntries({
	recording,
	entries,
}: ConsoleResult): string[] {
	if (!recording)
		return [
			'console recording is off; tick "Record console warnings and errors" on the assist extension\'s options page',
		];
	if (entries.length === 0) return ["no console entries match"];
	return entries.flatMap((entry) => [
		`${formatTime(entry.time)} ${entry.level} ${entry.url}`,
		...indent(entry.message, "  "),
		...(entry.stack ? indent(entry.stack, "    ") : []),
	]);
}
