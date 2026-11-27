import type { LogRules } from "./LogRules";

export function classifyLogLine(
	message: string,
	rules: LogRules,
): "error" | "ignored" | undefined {
	if (!rules.errors.some((pattern) => pattern.test(message))) return undefined;
	return rules.ignore.some((pattern) => pattern.test(message))
		? "ignored"
		: "error";
}
