import type { RestartTarget } from "../../../../watch/restartRules";

export type AutoRestartTarget = RestartTarget | "both";

export function autoRestartTarget(restart: RestartTarget[]): AutoRestartTarget {
	return restart.length > 1 ? "both" : restart[0];
}
