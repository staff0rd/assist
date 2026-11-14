import { readFileSync } from "node:fs";
import path from "node:path";
import { findClaudeFiles } from "./findClaudeFiles";
import { parseRulesSection } from "./parseRulesSection";
import { rulesSectionRange } from "./rulesSectionRange";
import type { RuleScope } from "./types";

function relativeDir(root: string, file: string): string {
	const rel = path.relative(root, path.dirname(file)).split(path.sep).join("/");
	return rel === "" ? "" : `${rel}/`;
}

export function claudeMdRuleScopes(root: string): RuleScope[] {
	const scopes = findClaudeFiles(root)
		.map((file) => ({ file, content: readFileSync(file, "utf8") }))
		.filter(({ content }) => rulesSectionRange(content.split(/\r?\n/)))
		.map(({ file, content }) => ({
			dir: relativeDir(root, file),
			rules: parseRulesSection(content),
		}))
		.sort((a, b) => a.dir.localeCompare(b.dir));
	return scopes.map(({ dir, rules }) => ({
		id: `claude-md:${dir}`,
		kind: "claude-md",
		name: `${dir}CLAUDE.md`,
		dir,
		depth: scopes.filter(
			(other) => other.dir !== dir && dir.startsWith(other.dir),
		).length,
		rules,
	}));
}
