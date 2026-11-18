import type { ChildProcess } from "node:child_process";
import type { SdkShellChunk } from "../../shared/SdkShellRow";
import { daemonLog } from "../daemonLog";

const MAX_LOG_LINE = 300;

export function pipeWorkflowOutput(
	child: ChildProcess,
	label: string,
	onData: (data: string, stream: SdkShellChunk["stream"]) => void,
): void {
	for (const stream of ["stdout", "stderr"] as const) {
		child[stream]?.setEncoding("utf8");
		child[stream]?.on("data", (chunk: string) => {
			for (const line of chunk.split("\n")) {
				const trimmed = line.trim();
				if (trimmed)
					daemonLog(`${label} workflow: ${trimmed.slice(0, MAX_LOG_LINE)}`);
			}
			onData(chunk, stream);
		});
	}
}
