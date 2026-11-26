import type { StepVerdict } from "./StepVerdict";

export function stepsExitCode(verdicts: StepVerdict[]): 0 | 1 {
	return verdicts.some((v) => v.verdict === "fail") ? 1 : 0;
}
