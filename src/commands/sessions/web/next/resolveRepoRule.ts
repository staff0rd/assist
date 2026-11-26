import type { NextRepoRule, NextRepoRules } from "./types";

function ruleFor(rules: NextRepoRules, key: string): NextRepoRule | undefined {
	const wanted = key.toLowerCase();
	const match = Object.keys(rules).find((k) => k.toLowerCase() === wanted);
	return match === undefined ? undefined : rules[match];
}

export function resolveRepoRule(
	rules: NextRepoRules,
	repo: string,
): NextRepoRule | undefined {
	return ruleFor(rules, repo) ?? ruleFor(rules, repo.split("/")[0]);
}
