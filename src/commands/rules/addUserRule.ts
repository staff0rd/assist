import chalk from "chalk";
import { loadGlobalConfigRaw } from "../../shared/loadConfig";
import { getGlobalConfigPath } from "../../shared/loadConfigFrom";
import { applyConfigSet } from "../config/applyConfigSet";
import { applyUserConfigSet } from "../config/applyUserConfigSet";
import { globalConfigFileLabel } from "../config/globalConfigFileLabel";
import { addToRepoDb } from "./addToRepoDb";
import { appendRule, type Rule } from "./appendRule";
import { failRule } from "./failRule";
import { adviceRuleError } from "./adviceRuleError";
import type { UserRuleOptions } from "./userRuleOptionsError";

async function addToUserDb(rule: Rule): Promise<void> {
	const result = await applyUserConfigSet("advice.rules", (current) =>
		appendRule(current, rule),
	);
	if (!result.ok) return failRule(result.errors.join("\n"));
	console.log(`Added ${chalk.cyan(rule.title)} to advice.rules in user (db)`);
}

function addToUserNode(rule: Rule, globalConfigPath: string): void {
	const advice = loadGlobalConfigRaw(globalConfigPath).advice as
		| { rules?: unknown }
		| undefined;
	const result = applyConfigSet(
		"advice.rules",
		appendRule(advice?.rules, rule),
		true,
		process.cwd(),
		globalConfigPath,
	);
	if (!result.ok) return failRule(result.errors.join("\n"));
	console.log(
		`Added ${chalk.cyan(rule.title)} to advice.rules in user (node) (${globalConfigFileLabel(globalConfigPath)})`,
	);
}

export async function addUserRule(
	text: string,
	options: UserRuleOptions,
	globalConfigPath: string = getGlobalConfigPath(),
	cwd: string = process.cwd(),
): Promise<void> {
	const error = adviceRuleError(text, options);
	if (error) return failRule(error);
	const rule = { title: options.title?.trim() ?? "", text: text.trim() };
	if (options.user) return addToUserDb(rule);
	if (options.repo !== undefined) return addToRepoDb(rule, options.repo, cwd);
	addToUserNode(rule, globalConfigPath);
}
