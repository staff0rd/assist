import type { HighLevelManualTesting } from "../../highLevel/types";
import type { InstanceAuth } from "../auth/InstanceAuth";
import type { InstancePlan } from "../InstancePlan";
import { createLogRules } from "../logs/createLogRules";
import { createStepErrorLog } from "../logs/createStepErrorLog";
import type { InstanceLogsConfig } from "../logs/InstanceLogsConfig";
import { streamComposeLogs } from "../logs/streamComposeLogs";
import { withStepErrors } from "../logs/withStepErrors";
import { formatStepsSummary } from "./formatStepsSummary";
import { instanceReportDir } from "./instanceReportDir";
import { runManualSteps } from "./runManualSteps";
import { stepsExitCode } from "./stepsExitCode";
import { writeStepsReport } from "./writeStepsReport";

type InstanceStepsInput = {
	instance: InstancePlan & { url: string };
	manualTesting: HighLevelManualTesting;
	logs: InstanceLogsConfig;
	abort: AbortController;
	headed?: boolean;
	auth?: InstanceAuth;
};

export async function runInstanceSteps(
	input: InstanceStepsInput,
): Promise<void> {
	const { instance } = input;
	const reportDir = instanceReportDir(instance.project);
	const errorLog = createStepErrorLog(createLogRules(input.logs));
	const composeLogs = streamComposeLogs(instance, (line) =>
		errorLog.record(line.service, line.message, line.at),
	);
	const result = await runManualSteps({
		url: instance.url,
		manualTesting: input.manualTesting,
		reportDir,
		abort: input.abort,
		headed: input.headed ?? false,
		errorLog,
		auth: input.auth,
		checkouts: instance.checkouts.map(({ services, repo, sha, source }) => ({
			services,
			repo,
			sha,
			source,
		})),
	}).finally(() => composeLogs.stop());
	const checked = withStepErrors(result, errorLog);
	writeStepsReport(reportDir, instance.url, checked);
	console.log(formatStepsSummary(checked, reportDir));
	if (stepsExitCode(checked.verdicts) !== 0) process.exitCode = 1;
}
