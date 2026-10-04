import { type RestartTarget, restartRules } from "./restartRules";

export function restartTargets(paths: string[]): RestartTarget[] {
	return restartRules
		.filter((rule) => paths.some(rule.matches))
		.map((rule) => rule.target);
}
