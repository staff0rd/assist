const CONTINUING_WORDS = new Set([
	"await",
	"const",
	"let",
	"var",
	"of",
	"in",
	"new",
	"typeof",
	"return",
	"yield",
	"else",
	"do",
]);

export function continuesAcrossNewline(
	src: string,
	lastSignificant: number,
	next: number,
): boolean {
	if (!/^(?:[\w$]|\/\/|\/\*)/.test(src.slice(next, next + 2))) return true;
	const prev = src[lastSignificant] ?? "";
	if (/[)\]}"'`]/.test(prev)) return false;
	if (!/[\w$]/.test(prev)) return true;
	const word = /[\w$]+$/.exec(src.slice(0, lastSignificant + 1))?.[0] ?? "";
	return CONTINUING_WORDS.has(word);
}
