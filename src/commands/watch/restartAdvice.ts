import { restartRules } from "./restartRules";

export function restartAdvice(paths: string[]): string[] {
	return restartRules
		.filter((rule) => paths.some(rule.matches))
		.map((rule) => rule.advice);
}
