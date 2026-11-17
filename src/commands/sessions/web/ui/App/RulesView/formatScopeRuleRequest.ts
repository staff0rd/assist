export function formatScopeRuleRequest(flag: string, note: string): string {
	return `/add-rule ${flag}\n\n${note.trim()}`;
}
