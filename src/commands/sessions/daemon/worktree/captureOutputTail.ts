import type { ChildProcess } from "node:child_process";

const OUTPUT_TAIL = 2000;

export function captureOutputTail(child: ChildProcess): () => string {
	let output = "";
	const capture = (chunk: Buffer) => {
		output = (output + chunk.toString()).slice(-OUTPUT_TAIL);
	};
	child.stdout?.on("data", capture);
	child.stderr?.on("data", capture);
	return () => output.trim();
}
