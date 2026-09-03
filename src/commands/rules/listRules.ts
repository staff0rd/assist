import path from "node:path";
import chalk from "chalk";
import { findRepoRoot } from "../../shared/findRepoRoot";
import { readScopedRules } from "./readScopedRules";
import { scopeDirectory } from "./scopeDirectory";

export function listRules(
	target?: string,
	options: { full?: boolean } = {},
): void {
	const resolved = path.resolve(target ?? process.cwd());
	const rules = readScopedRules(resolved);

	if (rules.length === 0) {
		const label = path.relative(process.cwd(), resolved) || ".";
		console.log(chalk.gray(`No rules in scope for ${label}`));
		return;
	}

	const base = findRepoRoot(scopeDirectory(resolved));
	const width = Math.max(...rules.map((rule) => rule.code.length));
	let shown: string | undefined;
	for (const rule of rules) {
		if (rule.source !== shown) {
			shown = rule.source;
			console.log(
				chalk.dim(base ? path.relative(base, rule.source) : rule.source),
			);
		}
		console.log(
			`  ${chalk.cyan(rule.code.padEnd(width))}  ${rule.title ?? rule.text}`,
		);
		if (options.full && rule.title)
			console.log(`  ${" ".repeat(width)}  ${chalk.dim(rule.text)}`);
	}
}
