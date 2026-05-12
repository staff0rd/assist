import type { ChildProcess } from "node:child_process";

function flushBuffer(buffer: string, onLine: (line: string) => void): string {
	let remaining = buffer;
	while (true) {
		const idx = remaining.indexOf("\n");
		if (idx === -1) return remaining;
		const line = remaining.slice(0, idx);
		remaining = remaining.slice(idx + 1);
		if (line.trim()) onLine(line);
	}
}

export function attachLineParser(
	child: ChildProcess,
	onLine: (line: string) => void,
): () => void {
	let buffer = "";
	child.stdout?.on("data", (chunk: Buffer) => {
		buffer += chunk.toString("utf-8");
		buffer = flushBuffer(buffer, onLine);
	});
	return () => {
		if (buffer.trim()) onLine(buffer);
	};
}
