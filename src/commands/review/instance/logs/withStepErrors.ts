import type { ManualStepsResult } from "../steps/ManualStepsResult";
import type { StepErrorLog } from "./createStepErrorLog";

export function withStepErrors(
	result: ManualStepsResult,
	errorLog: StepErrorLog,
): ManualStepsResult {
	return {
		...result,
		verdicts: result.verdicts.map((verdict) => ({
			...verdict,
			errors: errorLog.errorsFor(verdict.step),
		})),
		ignoredErrors: errorLog.ignored,
	};
}
