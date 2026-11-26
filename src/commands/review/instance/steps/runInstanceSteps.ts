import type { HighLevelManualTesting } from "../../highLevel/types";
import { formatStepsSummary } from "./formatStepsSummary";
import { instanceReportDir } from "./instanceReportDir";
import { runManualSteps } from "./runManualSteps";
import { stepsExitCode } from "./stepsExitCode";

export async function runInstanceSteps(
	instance: { project: string; url: string },
	manualTesting: HighLevelManualTesting,
	abort: AbortController,
	headed = false,
): Promise<void> {
	const reportDir = instanceReportDir(instance.project);
	const { verdicts, video } = await runManualSteps({
		url: instance.url,
		manualTesting,
		reportDir,
		abort,
		headed,
	});
	console.log(formatStepsSummary(verdicts, reportDir, video));
	if (stepsExitCode(verdicts) !== 0) process.exitCode = 1;
}
