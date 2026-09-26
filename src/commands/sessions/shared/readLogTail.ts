import { closeSync, fstatSync, openSync, readSync } from "node:fs";

const MAX_TAIL_BYTES = 4 * 1024 * 1024;

function completeLines(text: string, windowIsPartial: boolean): string[] {
	const all = text.split("\n");
	if (all.at(-1) === "") all.pop();
	if (windowIsPartial) all.shift();
	return all;
}

export function readLogTail(path: string, lines: number): string[] {
	let fd: number;
	try {
		fd = openSync(path, "r");
	} catch {
		return [];
	}
	try {
		const size = fstatSync(fd).size;
		const length = Math.min(size, MAX_TAIL_BYTES);
		const buffer = Buffer.alloc(length);
		readSync(fd, buffer, 0, length, size - length);
		return completeLines(buffer.toString("utf8"), length < size).slice(-lines);
	} finally {
		closeSync(fd);
	}
}
