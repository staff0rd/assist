import chalk from "chalk";
import { getDb } from "../../shared/db/getDb";
import { applySharedRepoConfigSet } from "../config/applySharedRepoConfigSet";
import { resolveSharedRepoBlock } from "../config/resolveSharedRepoBlock";
import { appendRule, type Rule } from "./appendRule";
import { failRule } from "./failRule";

export async function addToRepoDb(
	rule: Rule,
	repo: boolean | string,
	cwd: string,
): Promise<void> {
	const repoName = typeof repo === "string" ? repo : undefined;
	const { block } = await resolveSharedRepoBlock(await getDb(), repoName, cwd);
	const advice = block.advice as { rules?: unknown } | undefined;
	const result = await applySharedRepoConfigSet(
		"advice.rules",
		appendRule(advice?.rules, rule),
		repoName,
		cwd,
	);
	if (!result.ok) return failRule(result.errors.join("\n"));
	console.log(
		`Added ${chalk.cyan(rule.title)} to advice.rules in repo (db): ${result.label}`,
	);
}
