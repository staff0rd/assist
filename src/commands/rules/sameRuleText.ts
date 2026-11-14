type RuleText = { title?: string; text: string };

export function sameRuleText(a: RuleText, b: RuleText): boolean {
	return (a.title ?? "") === (b.title ?? "") && a.text === b.text;
}
