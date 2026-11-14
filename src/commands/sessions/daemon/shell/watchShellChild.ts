import type { ChildProcess } from "node:child_process";
import type { SdkShellRow } from "../../shared/SdkShellRow";
import { appendShellOutput } from "./appendShellOutput";
import { finishShellRow } from "./finishShellRow";
import { throttleNotify } from "./throttleNotify";

export function watchShellChild(
	child: ChildProcess,
	row: SdkShellRow,
	label: string,
	notify: () => void,
): void {
	const update = throttleNotify(notify);
	const finish = (exitCode: number, reason: string) => {
		if (!finishShellRow(row, label, exitCode, reason)) return;
		update.cancel();
		notify();
	};
	for (const stream of ["stdout", "stderr"] as const) {
		child[stream]?.setEncoding("utf8");
		child[stream]?.on("data", (chunk: string) => {
			appendShellOutput(row, stream, chunk);
			update();
		});
	}
	child.on("error", (error) => {
		appendShellOutput(row, "stderr", `${error.message}\n`);
		finish(127, `spawn failed: ${error.message}`);
	});
	child.on("close", (code, signal) =>
		finish(code ?? 1, signal ? `signal ${signal}` : `code ${code}`),
	);
}
