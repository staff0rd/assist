import { compileLogPatterns } from "./compileLogPatterns";
import type { InstanceLogsConfig } from "./InstanceLogsConfig";
import type { LogRules } from "./LogRules";

export const BROWSER_SOURCE = "browser";
const DEFAULT_ERROR_PATTERNS = ["error", "exception", "fatal"];
const EVERY_MESSAGE = [/(?:)/];

export function createLogRules(
	logs: InstanceLogsConfig,
): (source: string) => LogRules {
	const key = "review.instance.logs";
	const browser: LogRules = {
		errors: EVERY_MESSAGE,
		ignore: compileLogPatterns(logs.browser.ignore, `${key}.browser.ignore`),
	};
	const cache = new Map<string, LogRules>([[BROWSER_SOURCE, browser]]);
	return (source) => {
		const cached = cache.get(source);
		if (cached) return cached;
		const service = logs.services[source];
		const rules = {
			errors: compileLogPatterns(
				service?.errorPatterns ?? DEFAULT_ERROR_PATTERNS,
				`${key}.services.${source}.errorPatterns`,
			),
			ignore: compileLogPatterns(
				service?.ignore ?? [],
				`${key}.services.${source}.ignore`,
			),
		};
		cache.set(source, rules);
		return rules;
	};
}
