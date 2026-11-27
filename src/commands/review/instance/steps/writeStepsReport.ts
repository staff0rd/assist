import { writeFileSync } from "node:fs";
import { join } from "node:path";
import type { ManualStepsResult } from "./ManualStepsResult";

export function writeStepsReport(
	reportDir: string,
	url: string,
	result: ManualStepsResult,
): void {
	writeFileSync(
		join(reportDir, "report.json"),
		`${JSON.stringify({ url, video: result.video, ignoredErrors: result.ignoredErrors, steps: result.verdicts }, null, 2)}\n`,
	);
}
