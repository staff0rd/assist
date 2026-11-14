import { changedSince } from "./changedSince";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { parseRulesSection } from "./parseRulesSection";
import { rewriteRuleBullet } from "./rewriteRuleBullet";
import { ruleBullet } from "./ruleBullet";
import type { RuleWritePlan } from "./RulePlanContext";
import { sameRuleText } from "./sameRuleText";
import type { RuleEntry } from "./types";

type Replacement = { title?: string; text: string } | undefined;

export function planClaudeMd(
	file: string,
	name: string,
	rule: RuleEntry,
	replacement: Replacement,
): RuleWritePlan {
	const { code } = rule;
	if (!code) return { ok: false, error: `Rules in ${name} need a code` };
	const content = existsSync(file) ? readFileSync(file, "utf8") : "";
	const current = parseRulesSection(content).find((r) => r.code === code);
	if (!current || !sameRuleText(current, rule)) return changedSince(rule, name);
	const after = rewriteRuleBullet(
		content,
		code,
		replacement && ruleBullet({ code, ...replacement }),
	);
	if (after === undefined) return changedSince(rule, name);
	return {
		ok: true,
		write: async () => {
			writeFileSync(file, after);
			return undefined;
		},
	};
}
