import type { ChildProcess } from "node:child_process";
import { daemonLog } from "../daemonLog";

const MAX_LOG_LINE = 300;

export function pipeWorkflowOutput(
	child: ChildProcess,
	label: string,
	onData: (data: string) => void,
): void {
	for (const stream of [child.stdout, child.stderr]) {
		stream?.setEncoding("utf8");
		stream?.on("data", (chunk: string) => {
			for (const line of chunk.split("\n")) {
				const trimmed = line.trim();
				if (trimmed)
					daemonLog(`${label} workflow: ${trimmed.slice(0, MAX_LOG_LINE)}`);
			}
			onData(chunk.replaceAll("\n", "\r\n"));
		});
	}
}
