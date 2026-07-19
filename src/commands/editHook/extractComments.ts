import { isCommentExempt } from "../verify/blockCodeComments/isCommentExempt";

const SOURCE_EXTENSIONS = [
	".ts",
	".tsx",
	".cts",
	".mts",
	".js",
	".jsx",
	".cjs",
	".mjs",
	".bicep",
	".bicepparam",
];

/** Code-comment syntax only matters in source files, not markdown/yaml/json. */
export function isSourceFile(filePath: string | undefined): boolean {
	if (!filePath) return false;
	return SOURCE_EXTENSIONS.some((ext) => filePath.endsWith(ext));
}

function blankNonNewline(text: string): string {
	return text.replace(/[^\n]/g, " ");
}

/**
 * Fast regex-based comment detector for // and block comments. Blanks string
 * literals first, so // and /* inside strings or URLs are not mistaken for
 * comments. Heuristic, not a full lexer, but covers the common edit cases
 * without pulling in ts-morph.
 */
export function extractComments(text: string): string[] {
	const comments: string[] = [];

	let work = text.replace(
		/"(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'|`(?:[^`\\]|\\.)*`/g,
		blankNonNewline,
	);

	work = work.replace(/\/\*[\s\S]*?\*\//g, (match) => {
		comments.push(match);
		return blankNonNewline(match);
	});

	for (const match of work.matchAll(/\/\/.*/g)) {
		comments.push(match[0]);
	}

	return comments
		.map((comment) => comment.replace(/\s+/g, " ").trim())
		.filter((comment) => comment.length > 0)
		.filter((comment) => !isCommentExempt(comment));
}
