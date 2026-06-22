import { minimatch } from "minimatch";
import type { ForbiddenStringsRule } from "../../../shared/types";

type ForbiddenStringViolation = {
	file: string;
	path: string;
	value: string;
};

export function resolveStringsAtPath(data: unknown, path: string): string[] {
	let current: unknown = data;
	for (const segment of path.split(".")) {
		if (current === null || typeof current !== "object") return [];
		current = (current as Record<string, unknown>)[segment];
	}
	if (typeof current === "string") return [current];
	if (Array.isArray(current))
		return current.filter(
			(value): value is string => typeof value === "string",
		);
	return [];
}

export function findRuleViolations(
	data: unknown,
	rule: ForbiddenStringsRule,
): ForbiddenStringViolation[] {
	const violations: ForbiddenStringViolation[] = [];
	for (const path of rule.paths) {
		for (const value of resolveStringsAtPath(data, path)) {
			if (minimatch(value, rule.disallowed))
				violations.push({ file: rule.file, path, value });
		}
	}
	return violations;
}

export function findForbiddenStrings(
	rules: ForbiddenStringsRule[],
	readJson: (file: string) => unknown,
): ForbiddenStringViolation[] {
	return rules.flatMap((rule) => findRuleViolations(readJson(rule.file), rule));
}
