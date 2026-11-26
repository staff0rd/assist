import type { HighLevelManualTesting } from "../../highLevel/types";
import { formatStepsSummary } from "./formatStepsSummary";
import { instanceReportDir } from "./instanceReportDir";
import { runManualSteps } from "./runManualSteps";
import { stepsExitCode } from "./stepsExitCode";

export async function runInstanceSteps(
	instance: { project: string; url: string },
	manualTesting: HighLevelManualTesting,
	abort: AbortController,
): Promise<void> {
	const reportDir = instanceReportDir(instance.project);
	const verdicts = await runManualSteps({
		url: instance.url,
		manualTesting,
		reportDir,
		abort,
	});
	console.log(formatStepsSummary(verdicts, reportDir));
	if (stepsExitCode(verdicts) !== 0) process.exitCode = 1;
}
