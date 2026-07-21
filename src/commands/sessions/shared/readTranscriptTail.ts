import * as fs from "node:fs";

const DEFAULT_MAX_BYTES = 256 * 1024;

function parseTailEntries(raw: string): Record<string, unknown>[] {
	const entries: Record<string, unknown>[] = [];
	for (const line of raw.split("\n")) {
		const trimmed = line.trim();
		if (!trimmed) continue;
		try {
			const parsed = JSON.parse(trimmed);
			if (parsed && typeof parsed === "object")
				entries.push(parsed as Record<string, unknown>);
		} catch {}
	}
	return entries;
}

function dropPartialFirstLine(raw: string, sliced: boolean): string {
	if (!sliced) return raw;
	const newline = raw.indexOf("\n");
	return newline === -1 ? "" : raw.slice(newline + 1);
}

export async function readTranscriptTail(
	filePath: string,
	maxBytes = DEFAULT_MAX_BYTES,
): Promise<Record<string, unknown>[]> {
	let handle: fs.promises.FileHandle | undefined;
	try {
		handle = await fs.promises.open(filePath, "r");
		const { size } = await handle.stat();
		const start = Math.max(0, size - maxBytes);
		const length = size - start;
		if (length === 0) return [];
		const buf = Buffer.alloc(length);
		await handle.read(buf, 0, length, start);
		return parseTailEntries(
			dropPartialFirstLine(buf.toString("utf8"), start > 0),
		);
	} catch {
		return [];
	} finally {
		await handle?.close();
	}
}

export function readTranscriptTailSync(
	filePath: string,
	maxBytes = DEFAULT_MAX_BYTES,
): Record<string, unknown>[] {
	let fd: number | undefined;
	try {
		fd = fs.openSync(filePath, "r");
		const { size } = fs.fstatSync(fd);
		const start = Math.max(0, size - maxBytes);
		const length = size - start;
		if (length === 0) return [];
		const buf = Buffer.alloc(length);
		fs.readSync(fd, buf, 0, length, start);
		return parseTailEntries(
			dropPartialFirstLine(buf.toString("utf8"), start > 0),
		);
	} catch {
		return [];
	} finally {
		if (fd !== undefined) fs.closeSync(fd);
	}
}
