import type { Readable } from "node:stream";
import { StringDecoder } from "node:string_decoder";

export function forEachCompleteLine(
	input: Readable,
	onLine: (line: string) => void,
	onTruncated: (partial: string) => void,
): void {
	const decoder = new StringDecoder("utf8");
	let buffered = "";

	input.on("data", (chunk: Buffer | string) => {
		const searchFrom = buffered.length;
		buffered += typeof chunk === "string" ? chunk : decoder.write(chunk);
		let lineStart = 0;
		let newline = buffered.indexOf("\n", searchFrom);
		while (newline !== -1) {
			const line = buffered.slice(lineStart, newline);
			onLine(line.endsWith("\r") ? line.slice(0, -1) : line);
			lineStart = newline + 1;
			newline = buffered.indexOf("\n", lineStart);
		}
		buffered = buffered.slice(lineStart);
	});

	const flushTruncated = () => {
		const partial = buffered + decoder.end();
		buffered = "";
		if (partial) onTruncated(partial);
	};
	input.on("end", flushTruncated);
	input.on("close", flushTruncated);
}
