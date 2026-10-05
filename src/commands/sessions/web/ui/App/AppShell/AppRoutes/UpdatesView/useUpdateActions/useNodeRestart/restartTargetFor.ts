import type { RestartTarget as AdvisedTarget } from "../../../../../../../../../watch/restartRules";
import type { RestartTarget } from "../../../../postRestart";

export function restartTargetFor(
	advice: AdvisedTarget[],
): RestartTarget | undefined {
	if (advice.length > 1) return "both";
	return advice[0];
}
