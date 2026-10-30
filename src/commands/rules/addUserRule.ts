import chalk from "chalk";
import { loadGlobalConfigRaw } from "../../shared/loadConfig";
import { getGlobalConfigPath } from "../../shared/loadConfigFrom";
import { applyConfigSet } from "../config/applyConfigSet";
import { applyUserConfigSet } from "../config/applyUserConfigSet";
import { globalConfigFileLabel } from "../config/globalConfigFileLabel";

type UserRuleOptions = {
	scope?: string;
	title?: string;
	user?: boolean;
	node?: boolean;
};

type Rule = { title: string; text: string };

function fail(message: string): void {
	console.error(chalk.red(message));
	process.exitCode = 1;
}

function asRules(value: unknown): unknown[] {
	return Array.isArray(value) ? value : [];
}

function optionsError(options: UserRuleOptions): string | undefined {
	if (options.user && options.node)
		return "--user writes user (db) and --node writes user (node); pass one";
	if (options.scope !== undefined)
		return "--user and --node write advice.rules, not a CLAUDE.md, and cannot be combined with --scope";
	return undefined;
}

async function addToUserDb(rule: Rule): Promise<void> {
	const result = await applyUserConfigSet("advice.rules", (current) => [
		...asRules(current),
		rule,
	]);
	if (!result.ok) return fail(result.errors.join("\n"));
	console.log(`Added ${chalk.cyan(rule.title)} to advice.rules in user (db)`);
}

function addToUserNode(rule: Rule, globalConfigPath: string): void {
	const advice = loadGlobalConfigRaw(globalConfigPath).advice as
		| { rules?: unknown }
		| undefined;
	const result = applyConfigSet(
		"advice.rules",
		[...asRules(advice?.rules), rule],
		true,
		process.cwd(),
		globalConfigPath,
	);
	if (!result.ok) return fail(result.errors.join("\n"));
	console.log(
		`Added ${chalk.cyan(rule.title)} to advice.rules in user (node) (${globalConfigFileLabel(globalConfigPath)})`,
	);
}

export async function addUserRule(
	text: string,
	options: UserRuleOptions,
	globalConfigPath: string = getGlobalConfigPath(),
): Promise<void> {
	const error = optionsError(options);
	if (error) return fail(error);
	const rule = { title: options.title?.trim() ?? "", text: text.trim() };
	if (rule.text === "" || rule.title === "")
		return fail("User rules need both rule text and --title");
	if (options.user) return addToUserDb(rule);
	addToUserNode(rule, globalConfigPath);
}
