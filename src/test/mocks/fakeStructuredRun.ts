import { writeFileSync } from "node:fs";
import type { ReviewerResult } from "../../commands/review/runStreamingChild";
import type { StructuredRun } from "../../shared/harnessAdapters/types";

export function fakeStructuredRun(
	calls: StructuredRun[],
): (run: StructuredRun) => Promise<ReviewerResult> {
	return (run) => {
		calls.push(run);
		run.spinner?.(run.model);
		writeFileSync(run.outputPath, `# fake ${run.name}\n`);
		return Promise.resolve({
			name: run.name,
			command: "fake-harness",
			model: run.model,
			outputPath: run.outputPath,
			exitCode: 0,
			stderr: "",
		});
	};
}
