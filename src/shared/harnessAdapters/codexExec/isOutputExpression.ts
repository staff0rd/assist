const ALLOWED = /^[\w$.{}:,()[\]]+$/;
const IDENTIFIER = /(?<![\w$.])[A-Za-z_$][\w$]*/g;

export function isOutputExpression(
	expression: string,
	bound: ReadonlySet<string>,
): boolean {
	const code = expression
		.replaceAll("...", "")
		.replace(/JSON\.stringify\(/g, "(");
	if (!ALLOWED.test(code) || /[\w$]\(/.test(code)) return false;
	for (const match of code.matchAll(IDENTIFIER)) {
		const isKey = code[match.index + match[0].length] === ":";
		if (!isKey && !bound.has(match[0])) return false;
	}
	return true;
}
