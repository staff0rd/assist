type AdviceRule = { title: string; text: string };

function isAdviceRule(value: unknown): value is AdviceRule {
	const rule = value as Partial<AdviceRule> | null;
	return typeof rule?.title === "string" && typeof rule.text === "string";
}

export function adviceRulesOf(raw: Record<string, unknown>): AdviceRule[] {
	const advice = raw.advice as { rules?: unknown } | undefined;
	return Array.isArray(advice?.rules) ? advice.rules.filter(isAdviceRule) : [];
}
