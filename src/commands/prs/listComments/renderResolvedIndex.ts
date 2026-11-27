import type { Style } from "./commentStyle";
import { firstLine } from "./firstLine";
import { type Thread, threadLocation } from "./groupThreads";

export function renderResolvedIndex(threads: Thread[], style: Style): string {
	const lines = [style.cyan(`Resolved threads (${threads.length})`)];
	for (const thread of threads) {
		const first = thread.comments[0];
		if (!first) continue;
		const count =
			thread.comments.length > 1 ? ` (${thread.comments.length} comments)` : "";
		lines.push(
			`  ${style.bold(threadLocation(first))} ${first.user}: ${firstLine(first.body)}${count}`,
		);
	}
	lines.push("");
	return lines.join("\n");
}
