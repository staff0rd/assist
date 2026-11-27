import type { StepVerdict } from "./StepVerdict";

export function stepsExitCode(verdicts: StepVerdict[]): 0 | 1 {
	return verdicts.some(
		(v) => v.verdict === "fail" || (v.errors?.length ?? 0) > 0,
	)
		? 1
		: 0;
}
