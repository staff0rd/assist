export type Rule = { title: string; text: string };

export function appendRule(current: unknown, rule: Rule): unknown[] {
	return [...(Array.isArray(current) ? current : []), rule];
}
