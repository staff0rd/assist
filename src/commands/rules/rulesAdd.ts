import { getGlobalConfigPath } from "../../shared/loadConfigFrom";
import { addRule } from "./addRule";
import { addUserRule } from "./addUserRule";
import { adviceRuleError } from "./adviceRuleError";
import { describeRuleTarget } from "./describeRuleTarget";
import { failRule } from "./failRule";
import { reviewProposedRule } from "./reviewProposedRule";
import type { UserRuleOptions } from "./userRuleOptionsError";

export async function rulesAdd(
	text: string,
	options: UserRuleOptions,
	globalConfigPath: string = getGlobalConfigPath(),
	cwd: string = process.cwd(),
): Promise<void> {
	const toAdvice = options.user || options.node || options.repo !== undefined;
	const error = toAdvice
		? adviceRuleError(text, options)
		: text.trim() === ""
			? "Rule text is required"
			: undefined;
	if (error) return failRule(error);

	await reviewProposedRule(
		{ title: options.title?.trim() || undefined, text: text.trim() },
		await describeRuleTarget(options, globalConfigPath, cwd),
	);
	if (toAdvice) return addUserRule(text, options, globalConfigPath, cwd);
	addRule(text, options);
}
