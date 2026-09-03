import { existsSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import chalk from "chalk";
import { findRepoRoot } from "../../shared/findRepoRoot";
import { insertRuleBullet } from "./insertRuleBullet";
import { nextRuleCode } from "./nextRuleCode";
import { resolveRuleScope } from "./resolveRuleScope";
import { updateScopedRulesIndex } from "./updateScopedRulesIndex";

function read(file: string): string {
	return existsSync(file) ? readFileSync(file, "utf8") : "";
}

export function addRule(
	text: string,
	options: { scope?: string; title?: string },
): void {
	const rule = text.trim();
	if (rule === "") {
		console.error(chalk.red("Rule text is required"));
		process.exitCode = 1;
		return;
	}

	const target = resolveRuleScope(options.scope ?? process.cwd());
	const targetDir = path.dirname(target);
	const root = findRepoRoot(targetDir) ?? targetDir;
	const code = nextRuleCode(root);

	writeFileSync(
		target,
		insertRuleBullet(read(target), {
			code,
			title: options.title?.trim() || undefined,
			text: rule,
		}),
	);
	updateScopedRulesIndex(root);

	console.log(
		`Added ${chalk.cyan(code)} to ${path.relative(process.cwd(), target) || target}`,
	);
}
