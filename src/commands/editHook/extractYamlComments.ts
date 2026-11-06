const SHA_PINNED_USES = /^\s*(?:-\s+)?uses:\s*\S+@[0-9a-f]{40}\s+$/i;

function blankNonNewline(text: string): string {
	return text.replace(/[^\n]/g, " ");
}

function isShaPinVersionComment(work: string, index: number): boolean {
	const lineStart = work.lastIndexOf("\n", index - 1) + 1;
	return SHA_PINNED_USES.test(work.slice(lineStart, index));
}

export function extractYamlComments(text: string): string[] {
	const work = text.replace(
		/"(?:[^"\\]|\\.)*"|'(?:[^']|'')*'/g,
		blankNonNewline,
	);

	const comments: string[] = [];
	for (const match of work.matchAll(/(?:^|\s)(#.*)/gm)) {
		const hashIndex = match.index + match[0].length - match[1].length;
		if (isShaPinVersionComment(work, hashIndex)) continue;
		comments.push(match[1]);
	}

	return comments
		.map((comment) => comment.replace(/\s+/g, " ").trim())
		.filter((comment) => comment.length > 0);
}
