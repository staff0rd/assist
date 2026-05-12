import type { ChildProcess } from "node:child_process";

export function attachStderrCollector(child: ChildProcess): { value: string } {
	const state = { value: "" };
	child.stderr?.on("data", (chunk: Buffer) => {
		state.value += chunk.toString("utf-8");
	});
	return state;
}
