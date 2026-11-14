import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { insertRuleBullet } from "./insertRuleBullet";
import { nextRuleCode } from "./nextRuleCode";
import { readAdviceRules } from "./readAdviceRules";
import type { ruleScopeLocation } from "./ruleScopeLocation";
import type { RulePlanContext, RuleWritePlan } from "./RulePlanContext";
import { writeAdviceRules } from "./writeAdviceRules";

type Location = NonNullable<ReturnType<typeof ruleScopeLocation>>;

export async function planRuleAddition(
	location: Location,
	rule: { title?: string; text: string },
	ctx: RulePlanContext,
): Promise<RuleWritePlan> {
	const { root, cwd, globalConfigPath } = ctx;
	if (location.kind === "claude-md") {
		const { file } = location;
		if (!existsSync(file))
			return { ok: false, error: `${location.name} does not exist` };
		const code = nextRuleCode(root);
		const after = insertRuleBullet(readFileSync(file, "utf8"), {
			code,
			...rule,
		});
		return {
			ok: true,
			code,
			write: async () => {
				writeFileSync(file, after);
				return undefined;
			},
		};
	}
	const rules = await readAdviceRules(location.scope, cwd, globalConfigPath);
	const entry = { title: rule.title ?? "", text: rule.text };
	return {
		ok: true,
		write: () =>
			writeAdviceRules(
				location.scope,
				[...rules, entry],
				cwd,
				globalConfigPath,
			),
	};
}
