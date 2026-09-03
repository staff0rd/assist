import { RULE_BULLET, rulesSectionRange } from "./rulesSectionRange";

const RULE_TITLE = /^\*\*\s*([^*]+?)\s*\*\*\s*(?:[—–:-]\s*)?(.*)$/;

type ParsedRule = {
	code: string;
	title?: string;
	text: string;
};

function splitTitle(rest: string): { title?: string; text: string } {
	const match = RULE_TITLE.exec(rest);
	if (!match) return { text: rest };

	const title = match[1].trim();
	const text = match[2].trim();
	return title === "" || text === "" ? { text: rest } : { title, text };
}

export function parseRulesSection(content: string): ParsedRule[] {
	const lines = content.split(/\r?\n/);
	const range = rulesSectionRange(lines);
	if (!range) return [];

	const rules: ParsedRule[] = [];
	for (const line of lines.slice(range.start + 1, range.end)) {
		const match = RULE_BULLET.exec(line);
		if (!match) continue;
		const code = match[1].trim();
		const rest = match[2].trim();
		if (code === "" || rest === "") continue;
		rules.push({ code, ...splitTitle(rest) });
	}
	return rules;
}
