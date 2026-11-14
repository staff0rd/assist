import {
	contentLines,
	RULE_BULLET,
	rulesSectionRange,
} from "./rulesSectionRange";

export function rewriteRuleBullet(
	content: string,
	code: string,
	replacement: string | undefined,
): string | undefined {
	const lines = contentLines(content);
	const range = rulesSectionRange(lines);
	if (!range) return undefined;
	const index = lines.findIndex(
		(line, i) =>
			i > range.start &&
			i < range.end &&
			RULE_BULLET.exec(line)?.[1].trim() === code,
	);
	if (index === -1) return undefined;
	const next = [...lines];
	if (replacement !== undefined) next[index] = replacement;
	else {
		const blankAround =
			next[index - 1]?.trim() === "" && (next[index + 1] ?? "").trim() === "";
		next.splice(index, blankAround ? 2 : 1);
	}
	return `${next.join("\n").trimEnd()}\n`;
}
