import type { ScopedRule } from "../../../../../../rules/types";

export function ruleCitationNote(rule: ScopedRule): string {
	return `The quoted text breaks rule ${rule.code} (${rule.source}) — ${rule.text}\n\nRectify the quoted text so it follows that rule.`;
}
