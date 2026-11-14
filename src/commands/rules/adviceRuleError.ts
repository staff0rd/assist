import {
	type UserRuleOptions,
	userRuleOptionsError,
} from "./userRuleOptionsError";

export function adviceRuleError(
	text: string,
	options: UserRuleOptions,
): string | undefined {
	const error = userRuleOptionsError(options);
	if (error) return error;
	if (text.trim() === "" || !options.title?.trim())
		return "advice.rules entries need both rule text and --title";
	return undefined;
}
