import { type PatternToken, readPatternList } from "./readPatternList";

type CodexRulePerms = { allow: string[]; deny: string[] };

const PREFIX_RULE_RE = /prefix_rule\s*\(/g;
const DECISION_RE = /decision\s*=\s*["'](\w+)["']/;
const PATTERN_RE = /pattern\s*=\s*\[/;

function expandPattern(tokens: PatternToken[]): string[] {
	return tokens.reduce<string[]>(
		(prefixes, token) => {
			const alternatives = Array.isArray(token)
				? token.filter((t): t is string => typeof t === "string")
				: [token];
			return prefixes.flatMap((prefix) =>
				alternatives.map((alt) => (prefix ? `${prefix} ${alt}` : alt)),
			);
		},
		[""],
	);
}

function ruleBody(text: string, start: number): string {
	let depth = 1;
	let i = start;
	while (i < text.length && depth > 0) {
		if (text[i] === "(") depth++;
		if (text[i] === ")") depth--;
		i++;
	}
	return text.slice(start, i);
}

export function parseCodexRules(text: string): CodexRulePerms {
	const perms: CodexRulePerms = { allow: [], deny: [] };
	for (const match of text.matchAll(PREFIX_RULE_RE)) {
		const body = ruleBody(text, match.index + match[0].length);
		const patternMatch = PATTERN_RE.exec(body);
		if (!patternMatch) continue;
		const [tokens] = readPatternList(
			body,
			patternMatch.index + patternMatch[0].length - 1,
		);
		const decision = DECISION_RE.exec(body)?.[1] ?? "allow";
		const target =
			decision === "allow"
				? perms.allow
				: decision === "forbidden"
					? perms.deny
					: undefined;
		if (!target) continue;
		for (const command of expandPattern(tokens))
			if (command) target.push(`Bash(${command}:*)`);
	}
	return perms;
}
