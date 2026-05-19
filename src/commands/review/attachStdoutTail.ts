import type { ChildProcess } from "node:child_process";

export function attachStdoutTail(
	child: ChildProcess,
	maxBytes = 8192,
): { value: string } {
	const state = { value: "" };
	child.stdout?.on("data", (chunk: Buffer) => {
		state.value += chunk.toString("utf-8");
		if (state.value.length > maxBytes) {
			state.value = state.value.slice(state.value.length - maxBytes);
		}
	});
	return state;
}
